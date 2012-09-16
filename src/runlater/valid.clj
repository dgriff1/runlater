(ns runlater.valid
(:use [clojure.data.json] [runlater.client] [runlater.utils] [runlater.client :as rclient ] [validateur.validation ]) 
(:require [monger.collection :as mc] )
(:import [org.bson.types ObjectId]) )

(defn lookup_key [ userid headers ]
    (let [doc (mc/find-one-as-map "rlusers" { "$and" [ {(str "apikeys." (:runlater_key headers)) { "$exists" true}}  { :account userid  } ] }) ]
		(get  (:apikeys doc ) (keyword (:runlater_key headers) )) ))

(defn lookup_user [ userid ]
    (let [doc (mc/find-one-as-map "rlusers" { :account userid } ) ]
		(if doc 
			doc
		(throw (Exception. "Unable to find user" )))))

(defn no_id [doc] 
	(if (contains? doc :_id ) (throw (Exception. "Do not specify _id")) doc ))

(defn unique_email [ email ] 
	(do (prn "Email ", email, " -- ", (re-matcher #"^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$" email), " -- ", (mc/find-one-as-map "rlusers" { :email email } )  )
	(if (and email (re-matcher #"^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$" email) 
		(= nil (mc/find-one-as-map "rlusers" { :email email } ) ))
		email	
		(throw (Exception. "Invalid or duplicated email address"))
		)))

(defn unique_account [ account ] 
	(do (prn "Account ", account, " -- ", (re-matcher #"^\w*$" account), " -- ", (mc/find-one-as-map "rlusers" { :account account} )  )
	(if (and account (re-matcher #"^\w*$" account) 
		(= nil (mc/find-one-as-map "rlusers" { :account account } ) ))
		account	
		(throw (Exception. "Invalid or duplicated account name"))
		)))

(defn valid_hmac [userid json_str headers doc] 
	(let [hkey (lookup_key userid headers)]
		(if (and (contains? headers :runlater_hash)  hkey)
			(if (= (rclient/hmac hkey json_str) (get headers :runlater_hash)) ; replace later with looked up API Account secret
				doc
			(throw (Exception. (str "Invalid HMAC Hash" ) )))
		(throw (Exception. (str "Must supply valid runlater_key and runlater_hash in headers " userid ) ) ))) )

(defn check_auth [userid headers] 
	(let [user (lookup_user userid) ]
		(prn "Password " (:password user) " -- " (rclient/gensha (str rclient/rlsalt (:runlater_password headers)  ) ) " -- " (:runlater_password headers) " -- " headers )
		(if (= (:password user) (rclient/gensha (str rclient/rlsalt (:runlater_password headers)  ) ))
			user
			(throw (Exception. (str "Invalid password"))))))

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
