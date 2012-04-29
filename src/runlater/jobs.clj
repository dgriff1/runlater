(ns runlater.jobs
   (:require [clojure.data.json] [monger.collection :as mc] [monger.json] )
   (:use clojure.data.json)
    (:import [org.bson.types ObjectId]
               [com.mongodb DB WriteConcern]))


(defn to-json [objs]
    (json-str (for [o objs]
                (if (contains? o :_id )
                    (assoc o :_id (.toString (:_id o))
                    o )))))


(defn assert_task [ job ]
    (= (sort [:name :when :url])  (sort (keys job )) ))


(defn convert [json_stream]
    (assoc (read-json (slurp json_stream))  :_id (ObjectId.))   )

(defn index []
    {:status 200 :body (to-json (mc/find-maps "todos"))} )

(defn create [req body]
    (let [ doc (convert body) ]
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

