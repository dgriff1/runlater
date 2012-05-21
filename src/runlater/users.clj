(ns runlater.users
   (:require [clojure.data.json] [monger.collection :as mc] [monger.json] [monger.joda-time] [runlater.sched :as sched] [runlater.client :as rclient] )
   (:use clojure.data.json validateur.validation clj-time.format )
    (:import [org.bson.types ObjectId]
               [com.mongodb DB WriteConcern]))

(def user_validator (validation-set 
    (presence-of :name )
    (presence-of :url )
    (presence-of :when )
    (presence-of :interval)
    ))

(defn assert_task [ user ]
    (valid? user_validator user ))


(defn new_doc [json_str headers]  
      ((comp 
        (fn [m] (if (contains? m :_id ) m (throw "Do not specify _id"))) 
        (fn [m] (if (and (contains? headers :runlater_key ) (contains? headers :runlater_hash)) 
                  (if (= (rclient/hmac (:runlater_key headers) json_str) (:runlater_hash headers)) 
                      m 
                      (throw (Exception. "Invalid HMAC Hash")))
                  (throw (Exception. "Must Specify runlater_key and runlater_hash in headers") ))) 
      ) (read-json json_str) ))

(defn convert [doc]
    ((comp 
        (fn [m] (safe_assoc m :_id (ObjectId.)) )
        (fn [m] (assoc m :when (parse (formatters :date-time) (get m :when))))
        (fn [m] (assoc m :interval ( sched/split_into_hash (get m :interval "")))) 
    ) doc))


(defn index []
    {:status 200 :body ("Viewing all Users is not allowed")} )

(defn create [req body]
        (try (let [doc (convert (new_doc (slurp body) (:headers req)  )) ] 
              (mc/insert "rlusers" doc)
            {:status 201 :body (json-str doc ) })
        (catch Exception e 
            {:status 400 :body (.getLocalizedMessage e ) } )
             ))

(defn edit [id req body]
    {:status 200 :body (str "Edit " id " req " req " --" (read-json (slurp body )) ) } )

(defn delete [id req body]
    {:status 200 :body (str "Delete " id " " ( mc/remove "rlusers" { :_id (ObjectId. id) })) }  )

(defn lookup [id req body]
    {:status 200 :body (str "Lookup " id " req " req " --" (read-json (slurp body )) ) } )

