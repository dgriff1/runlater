(ns runlater.users
   (:require 	[clojure.data.json] 
   				[monger.collection :as mc] 
				[monger.json] 
				[monger.joda-time] 
				[runlater.sched :as sched] 
				[runlater.client :as rclient] 
				[clj-time.core :as clj-time] 
				[runlater.valid :as rvalid ] )
   (:use clojure.data.json validateur.validation clj-time.format runlater.utils clojure.walk )
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

(defn validate_user [req target]
	(let [headers (:headers (keywordize-keys req))]
		(if (and (contains? headers :runlater_password)
				(> 0 (count (:runlater_password headers)))
					(mc/find-one-as-map "rlusers" { :_id (ObjectId. target) :password (rclient/gensha (str rclient/rlsalt) (:runlater_password headers))  }))
					true 
			false
		)))


(defn new_doc [json_str headers]  
      ((comp 
        (fn [m] (if (contains? m :_id ) (throw (Exception. "Do not specify _id")) m )) 
      ) (read-json json_str) ))

(defn convert [doc]
    ((comp 
        (fn [m] (safe_assoc m :created (clj-time/now) ))
        (fn [m] (assoc m :apikeys {} ))
        (fn [m] (assoc m :password (if (> (count (:password m)) 0)  
              (rclient/gensha (str rclient/rlsalt (:password m)  ) )
              (throw (Exception. "Invalid password")))))
        (fn [m] (safe_assoc m :_id (ObjectId.) ))
        (fn [m] (if (rvalid/unique_email (get m :email) ) m ))
        (fn [m] (if (assert_user m) m (throw (Exception. "Missing Keys")) )))
    doc))

(defn delete_convert [doc]
    ((comp 
        (fn [m] (safe_assoc m :created (clj-time/now) ))
        (fn [m] (assoc m :apikeys {} ))
        (fn [m] (assoc m :password (if (> (count (:password m)) 0)  
              (rclient/gensha (str rclient/rlsalt (:password m)  ) )
              (throw (Exception. "Invalid password")))))
        (fn [m] (safe_assoc m :_id (get m :email) ))
        (fn [m] (if (assert_user m) m (throw (Exception. "Missing Keys")) )))
    doc))



;
; List all 
;
(defn index []
    {:status 400 :body "Viewing all Users is not allowed"} )


;
; Make a User
;
(defn create [req body]
        (try (let [doc (convert (new_doc (slurp body) (:headers req)  )) ] 
              (mc/insert "rlusers" doc)
            {:status 201 :body (json-str doc ) })
        (catch Exception e 
            {:status 400 :body (json-str { :error (.getLocalizedMessage e ) } ) } )
             ))
;
; Edit a user's info
;
(defn edit [id body req]
	(do 
		(rvalid/check_auth id (:headers req))
    	{:status 200 :body (str "Edit " id " req " req " --" (read-json (slurp body )) ) } ))


;
;Delete a user equiv to cancel account
;
(defn delete [id req]
  (try (let [doc (rvalid/check_auth id (:headers req)) ]
    {:status 200 :body (str "Delete " id " " ( mc/remove "rlusers" { :_id (ObjectId. id) })) }  )
  (catch Exception e 
    {:status 400 :body (json-str { :error (.getLocalizedMessage e) }) } )))


(defn sanitize_user [ doc ] 
  ((comp 
    (fn [m] (dissoc m :password))
    (fn [m] (dissoc m :apikeys))
    (fn [m] (assoc m :created (unparse (formatters :date-time) (:created m) ))) 
    ) doc))


;
; Lookup a User
; 
(defn lookup [id req]
    (let [doc (rvalid/check_auth id (:headers req)) ]
      {:status 200 :body (json-str (sanitize_user doc)) } ))

;
; Lookup a Users API keys
; 
(defn lookup_apikeys [userid req]
	(try 
    (let [doc (rvalid/check_auth userid (:headers req)) ]
      (if (or (nil? doc) (= (count (:apikeys doc)) 0 ))
	  	{:status 200 :body (json-str []) }  
		{:status 200 :body (json-str (keys (:apikeys doc)))}   ))
	(catch Exception e 
		{:status 400 :body (json-str { :error (.getLocalizedMessage e) })}
		)))

;
; Create an API key
; 
(defn create_apikey [id keyw body req]
    (try 
	(let [ doc (rvalid/check_auth id (:headers req)) ]
		(if (contains? (:apikeys doc) (keyword keyw ))
				{:status 400 :body (json-str {:error (str "API key " keyw " already created") } ) }
		(let [up_doc (assoc doc :apikeys (assoc (:apikeys doc) keyw (rclient/random-string 12) ))]  
			(last [ 
					(mc/save "rlusers" up_doc)
					{:status 201 :body (json-str { "public" (name keyw) "private" (get (:apikeys up_doc) keyw ) } ) }
				  ]
			)
			)
		)
	)
	(catch Exception e 
		{:status 400 :body (json-str { :error (.getLocalizedMessage e) })}
		))
)


;
; Delete  an API key
; 
(defn delete_apikey [id k body req]
	(try
    	(let [ doc (rvalid/check_auth id (:headers req))  keyw (keyword k)  ]
			(if (contains? (:apikeys doc) keyw )
				(last [ 
					(mc/save "rlusers" (assoc doc :apikeys (dissoc (:apikeys doc) keyw)))
    				{:status 200 :body (json-str { :message "API Key Deleted "}) }
					]
				)
    		{:status 400 :body (json-str { :error  (str "API Key " (name keyw) " Not Found "  ) }) } ))
	(catch Exception e 
		{:status 400 :body (json-str { :error (.getLocalizedMessage e) })}
		))
		)

