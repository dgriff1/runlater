(ns runlater.jobs
   (:require [clojure.data.json] [monger.collection :as mc] [monger.json] )
   (:use clojure.data.json validateur.validation )
    (:import [org.bson.types ObjectId]
               [com.mongodb DB WriteConcern]))

(defn safe_assoc [m k v] 
  (if (contains? m k) k (assoc m k v)))



(defn to-json [objs]
    (if (seq? objs) 
      (json-str (for [o objs]
        (if (contains? o :_id )
          o
          (assoc o :_id (.toString (:_id o))))))
      (json-str objs)))
    
(def jobs_validator (validation-set 
    (presence-of :name )
    (presence-of :url )
    (presence-of :when )
    (presence-of :interval)
    ))

(defn assert_task [ job ]
    (valid? jobs_validator job ))


(defn convert [json_stream]
  (let [doc (read-json json_stream)]
    (safe_assoc (assoc doc :_id (ObjectId.)) :interval "" ) ))

(defn index []
    {:status 200 :body (to-json (mc/find-maps "todos"))} )

(defn create [req body]
    (let [ doc (convert (slurp body)) ]
        (if (and ( assert_task doc) (mc/insert "todos" doc))
            {:status 201 :body (json-str doc ) }
            {:status 400 :body (str "Invalid Keys" ) }
            )) )

(defn edit [id req body]
    {:status 200 :body (str "Edit " id " req " req " --" (read-json (slurp body )) ) } )

(defn delete [id req body]
    {:status 200 :body (str "Delete " id " " ( mc/remove "todos" { :_id (ObjectId. id) })) }  )


(defn lookup [id req body]
    {:status 200 :body (str "Lookup " id " req " req " --" (read-json (slurp body )) ) } )

