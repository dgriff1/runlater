(ns runlater.jobs
   (:require [clojure.data.json] [monger.collection :as mc] [monger.json] [monger.joda-time] [runlater.sched :as sched] [runlater.client :as rclient] [runlater.utils] )
   (:use clojure.data.json validateur.validation clj-time.format runlater.utils clojure.walk )
    (:import [org.bson.types ObjectId]
               [com.mongodb DB WriteConcern]))


(def jobs_validator (validation-set 
    (presence-of :name )
    (presence-of :url )
    (presence-of :when )
    (presence-of :interval)
    (presence-of :headers)
    (presence-of :body)
    (presence-of :method)
    ))

(defn assert_task [ job ]
    (valid? jobs_validator job ))


(defn lookup_key [ headers ] 
	(let [doc (mc/find-one-as-map "rlusers" { (str "apikeys." (:runlater_key headers)) { "$exists" true}}) ]
			(get  (:apikeys doc ) (keyword (:runlater_key headers) )) )
)
	

(defn new_doc [json_str headers]  
      ((comp 
        (fn [m] (if (contains? m :_id ) (throw (Exception. "Do not specify _id")) m )) 
        (fn [m] (let [hkey (lookup_key headers)] 
			(if (and (contains? headers :runlater_hash)  hkey)
                  (if (= (rclient/hmac hkey json_str) (get headers :runlater_hash)) ; replace later with looked up API Account secret
                      m 
                      (throw (Exception. (str "Invalid HMAC Hash" ) )))
                  (throw (Exception. (str "Must supply valid runlater_key and runlater_hash in headers" ) ) ))) )
        (fn [m] (if (contains? headers :runlater_key)
					m
					(throw (Exception. "Must Specify runlater_key")) )  ) 
      ) (read-json json_str true) ))

(defn edit_doc [json_str headers]  
      ((comp 
        (fn [m] (let [hkey (lookup_key headers)] 
			(if (and (contains? headers :runlater_hash)  hkey)
                  (if (= (rclient/hmac hkey json_str) (get headers :runlater_hash)) ; replace later with looked up API Account secret
                      m 
                      (throw (Exception. (str "Invalid HMAC Hash " )   )))
                  (throw (Exception. (str "Must supply valid runlater_key and runlater_hash in headers" ) ) ))) )
        (fn [m] (if (contains? headers :runlater_key)
					m
					(throw (Exception. "Must Specify runlater_key")) )  ) 
      ) (read-json json_str true) ))

(defn convert [doc]
    ((comp 
        (fn [m] (safe_assoc m :_id (ObjectId.)) )
        (fn [m] (assoc m :when (parse (formatters :date-time) (get m :when))))
        (fn [m] (assoc m :interval ( sched/split_into_hash (get m :interval "")))) 
        (fn [m] (assoc m :doctype "job" ) ) 
        (fn [m] (assoc m :status "waiting" ) ) 
    ) doc))


(defn index []
    {:status 200 :body (to-json (mc/find-maps "rljobs"))} )

(defn create [req body]
      (do (prn "req ", req  ) 
        (try (let [doc (convert (new_doc (slurp body) (:headers (keywordize-keys req))  )) ] 
              (mc/insert "rljobs" doc)
            {:status 201 :body (json-str doc ) })
        (catch Exception e 
			(do (prn "Exception is " e " trace " (.printStackTrace e)) 
            {:status 400 :body (json-str { :error (.getLocalizedMessage e ) } ) }   ))
             )  ))

(defn edit [id req body]
    {:status 200 :body (str "Edit " id " req " req " --" (read-json (slurp body ) true ) ) } )

(defn delete [id req body]
    {:status 200 :body (str "Delete " id " " ( mc/remove "rljobs" { :_id (ObjectId. id) })) }  )

(defn lookup [id req body]
    {:status 200 :body (str "Lookup " id " req " req " --" (read-json (slurp body )) ) } )



