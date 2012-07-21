(ns runlater.valid
(:use [clojure.data.json] [runlater.client] [runlater.utils] [runlater.client :as rclient ] [validateur.validation ]) 
(:require [monger.collection :as mc] )
(:import [org.bson.types ObjectId]) )

(defn lookup_key [ userid headers ]
    (let [doc (mc/find-one-as-map "rlusers" { "$and" [ {(str "apikeys." (:runlater_key headers)) { "$exists" true}}  { :_id (ObjectId. userid)  } ] }) ]
		(get  (:apikeys doc ) (keyword (:runlater_key headers) )) ))

(defn no_id [doc] 
	(if (contains? doc :_id ) (throw (Exception. "Do not specify _id")) doc ))


(defn valid_hmac [userid json_str headers doc] 
	(let [hkey (lookup_key userid headers)]
		(if (and (contains? headers :runlater_hash)  hkey)
			(if (= (rclient/hmac hkey json_str) (get headers :runlater_hash)) ; replace later with looked up API Account secret
				doc
			(throw (Exception. (str "Invalid HMAC Hash" ) )))
		(throw (Exception. (str "Must supply valid runlater_key and runlater_hash in headers" ) ) ))) )

(defn has_runlater_key [headers doc] 
	(if (contains? headers :runlater_key)
		doc
	(throw (Exception. "Must Specify runlater_key")) )  )

(def jobs_validator (validation-set
	(presence-of :name )
	(presence-of :url )
	(presence-of :when )
	(presence-of :interval)
	(presence-of :headers)
	(presence-of :method)
))

(defn assert_job [ job ]
	(if (valid? jobs_validator job )
		job
		(throw (Exception. "Missing required fields"))))
