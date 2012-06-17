(ns runlater.users
   (:require [clojure.data.json] [monger.collection :as mc] [monger.json] [monger.joda-time] [runlater.sched :as sched] [runlater.client :as rclient] [clj-time.core :as clj-time] )
   (:use clojure.data.json validateur.validation clj-time.format runlater.utils )
    (:import [org.bson.types ObjectId]
               [com.mongodb DB WriteConcern]))

(def user_validator (validation-set 
    (presence-of :first )
    (presence-of :last )
    (presence-of :email )
    (presence-of :company )
    (presence-of :password )
    ))

(defn assert_user [ user ]
    (valid? user_validator user ))


(defn new_doc [json_str headers]  
      ((comp 
        (fn [m] (if (contains? m :_id ) (throw (Exception. "Do not specify _id")) m )) 
      ) (read-json json_str) ))

(defn convert [doc]
    ((comp 
        (fn [m] (safe_assoc m :created (clj-time/now) ))
        (fn [m] (assoc m :password (if (> (count (:password m)) 0)  
              (rclient/gensha (str rclient/rlsalt (:password m)  ) )
              (throw (Exception. "Invalid password")))))
        (fn [m] (safe_assoc m :_id (get m :email) ))
        (fn [m] (if (assert_user m) m (throw (Exception. "Missing Keys")) )))
    doc))


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

