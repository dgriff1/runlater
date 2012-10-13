(ns runlater.jobs
   (:require [clojure.data.json] [monger.collection :as mc] [monger.json] 
   		[monger.joda-time] [runlater.sched :as sched] [runlater.client :as rclient] [runlater.utils] [runlater.valid :as rvalid ] [clj-time.core] )
   (:use clojure.data.json clj-time.format runlater.utils [ monger.result :only [ok? has-error?]] [clojure.string :only [ lower-case]]  )
    (:import [org.bson.types ObjectId]
               [com.mongodb DB WriteConcern]))


(defn new_doc [json_str userid headers]  
      ((comp 
	  	rvalid/no_id
		(partial rvalid/valid_hmac userid json_str headers)
		(partial rvalid/has_runlater_key headers)
		rvalid/assert_job
      ) (read-json json_str true) ))

(defn edit_doc [json_str userid headers]  
      ((comp 
		(partial rvalid/valid_hmac userid json_str headers)
		(partial rvalid/has_runlater_key headers)
		rvalid/assert_job
      ) (read-json json_str true) ))

(defn convert_method [ doc  ]
	(let [k (keyword (lower-case (:method doc))) ]
		(if (contains? #{ :get :post :put :delete } k )	
			k
			(throw (Exception. (str "Invalid method " k))))))

(defn convert_job [doc userid headers]
    ((comp 
        (fn [m] (safe_assoc m :_id (ObjectId.)) )
        (fn [m] (assoc m :when (parse (formatters :date-time) (get m :when))))
        (fn [m] (assoc m :interval (if (map? (get m :interval "") ) 
							( rvalid/check_map (get m :interval ""))
							( sched/split_into_hash (get m :interval ""))  ))) 
        (fn [m] (assoc m :doctype "job" ) ) 
        (fn [m] (assoc m :status "waiting" ) ) 
        (fn [m] (assoc m :userid (str userid) ) ) 
        (fn [m] (assoc m :runlater_key (:runlater_key headers) )) 
        (fn [m] (assoc m :method (convert_method m)  ) ) 
    ) doc))


(defn update_job [doc] 
	(( comp 
		(fn [m]  (assoc m :editted (clj-time.core/now)))
		(fn [m]  (assoc m :when (parse (formatters :date-time) (get m :when))))
		(fn [m] (assoc m :status "waiting" ) )
		(fn [m] (assoc m :_id (ObjectId. (:_id m)) ))
	) doc))

(defn index [userid apikey request body]
	(do 
	(prn "Userid " userid ,  " api key " apikey " URL  " (:uri request) " headers " (:headers request) " user " (rvalid/lookup_user userid) )
	(try (rvalid/valid_hmac userid (:uri request) (:headers request) {} )
		(do 
			(prn "USERID " (mc/find-maps "rljobs" { :userid (str (:_id (rvalid/lookup_user userid))) :runlater_key apikey } ))
    	{:status 200 :body (to-json (mc/find-maps "rljobs" { :userid (str (:_id (rvalid/lookup_user userid))) :runlater_key apikey } ))})
        (catch Exception e 
			(do (prn "Exception is " e " trace " (.printStackTrace e)) 
            {:status 400 :body (json-str { :error (.getLocalizedMessage e ) } ) }   ))
		)))

(defn create [userid req body]
      (do 
	  	(prn "UserID " userid)
        (try (let [ user (rvalid/lookup_user userid) headers (:headers req) doc (convert_job (new_doc (slurp body) userid  headers ) (:_id user) headers ) ] 
              (mc/insert "rljobs" doc)
            {:status 201 :body (json-str doc ) })
        (catch Exception e 
			(do (prn "Exception is " e " trace " (.printStackTrace e)) 
            {:status 400 :body (json-str { :error (.getLocalizedMessage e ) } ) }   ))
             )  ))

(defn edit [id userid req body]
    (try (let [doc (update_job (edit_doc (slurp body) userid (:headers req)  )) ] 
		(mc/save "rljobs" doc)
    	{:status 200 :body (json-str doc) } )
	(catch Exception e 
		(do (prn "Exception is " e " trace " (.printStackTrace e)) 
        	{:status 400 :body (json-str { :error (.getLocalizedMessage e ) } ) }   ))
		))

(defn delete [id userid req body]
	(try (do 
		(rvalid/valid_hmac userid (:uri req) (:headers req) {})  
			(if (ok? (mc/remove "rljobs" {:_id (ObjectId. id)}))
    			{:status 200 :body (str "Delete " id " " ( mc/remove "rljobs" { :_id (ObjectId. id) })) }  
				(throw (Exception. "Unable to delete, is the ID valid?"))))
	(catch Exception e 
		(do (prn "Exception is " e " trace " (.printStackTrace e)) 
        	{:status 400 :body (json-str { :error (.getLocalizedMessage e ) } ) }   ))
		))


(defn lookup [id userid req body]
	(try (do 
		(rvalid/valid_hmac userid (:uri req) (:headers req) {} ) 
		(let [ user (rvalid/lookup_user userid) job (mc/find-one-as-map "rljobs" { :userid (str (:_id user)) :_id (ObjectId. id)  :runlater_key (:runlater_key (:headers req)) } ) ]
			(if  job
    			{:status 200 :body (to-json job)  }
				{:status 400 :body (to-json {:error "No Job Found" }) } )))
	(catch Exception e 
		(do (prn "Exception is " e " trace " (.printStackTrace e)) 
        	{:status 400 :body (json-str { :error (.getLocalizedMessage e ) } ) }   ))
		))
	



