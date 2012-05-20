(ns runlater.jobs
   (:require [clojure.data.json] [monger.collection :as mc] [monger.json] [monger.joda-time] [runlater.sched :as sched]  )
   (:use clojure.data.json validateur.validation clj-time.format )
    (:import [org.bson.types ObjectId]
               [com.mongodb DB WriteConcern]))

(defn safe_assoc [m k v] 
  (if (contains? m k) m (assoc m k v)))


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


(defn new_doc [json_stream]  
  (let [doc (read-json json_stream)] 
      ((comp 
        (fn [m] (if (contains? m :_id ) m (throw "Do not specify _id"))) 
        
      ) doc )))

(defn convert [doc]
    ((comp 
        (fn [m] (safe_assoc m :_id (ObjectId.)) )
        (fn [m] (assoc m :when (parse (formatters :date-time) (get m :when))))
        (fn [m] (assoc m :interval ( sched/split_into_hash (get m :interval "")))) 
    ) doc))


(defn index []
    {:status 200 :body (to-json (mc/find-maps "todos"))} )

(defn create [req body]
        (try (let [doc (convert (new_doc (slurp body))) ] 
              (mc/insert "jobs" doc)
            {:status 201 :body (json-str doc ) })
        (catch Exception e 
            {:status 400 :body (str e ) } )
             ))

(defn edit [id req body]
    {:status 200 :body (str "Edit " id " req " req " --" (read-json (slurp body )) ) } )

(defn delete [id req body]
    {:status 200 :body (str "Delete " id " " ( mc/remove "todos" { :_id (ObjectId. id) })) }  )


(defn lookup [id req body]
    {:status 200 :body (str "Lookup " id " req " req " --" (read-json (slurp body )) ) } )

