(ns runlater.jobs
   (:require [clojure.data.json] [monger.collection :as mc] [monger.json] [monger.joda-time] [runlater.sched :as sched] [runlater.client :as rclient] [runlater.utils] )
   (:use clojure.data.json validateur.validation clj-time.format runlater.utils )
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


(defn new_doc [json_str headers]  
      ((comp 
        (fn [m] (if (contains? m :_id ) (throw (Exception. "Do not specify _id")) m )) 
        (fn [m] (if (and (contains? headers "runlater_key" ) (contains? headers "runlater_hash")) 
                  (if (= (rclient/hmac "1234" json_str) (get headers "runlater_hash")) ; replace later with looked up API Account secret
                      m 
                      (throw (Exception. (str "Invalid HMAC Hash  " (rclient/hmac "1234" json_str) " -- "  (get headers "runlater_hash") " body " json_str)   )))
                  (throw (Exception. (str "Must Specify runlater_key and runlater_hash in headers" headers) ) ))) 
      ) (read-json json_str) ))

(defn convert [doc]
    ((comp 
        (fn [m] (safe_assoc m :_id (ObjectId.)) )
        (fn [m] (assoc m :when (parse (formatters :date-time) (get m :when))))
        (fn [m] (assoc m :interval ( sched/split_into_hash (get m :interval "")))) 
        (fn [m] (assoc m :doctype "job" ) ) 
    ) doc))


(defn index []
    {:status 200 :body (to-json (mc/find-maps "rljobs"))} )

(defn create [req body]
        (try (let [doc (convert (new_doc (slurp body) (:headers req)  )) ] 
              (mc/insert "rljobs" doc)
            {:status 201 :body (json-str doc ) })
        (catch Exception e 
            (last [ (prn e)
            {:status 400 :body (json-str { :error (.getLocalizedMessage e ) } ) }  ] )
             )))

(defn edit [id req body]
    {:status 200 :body (str "Edit " id " req " req " --" (read-json (slurp body )) ) } )

(defn delete [id req body]
    {:status 200 :body (str "Delete " id " " ( mc/remove "rljobs" { :_id (ObjectId. id) })) }  )

(defn lookup [id req body]
    {:status 200 :body (str "Lookup " id " req " req " --" (read-json (slurp body )) ) } )

