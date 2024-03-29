(ns runlater.test.jobs
  (:use [runlater.jobs ] [runlater.client] [runlater.utils]  )
  (:require [runlater.test.users :as usertests] )
  (:use [clojure.test] [clojure.data.json] ))

(deftest test_conversion ;; Test massaging the JSON
  (let [doc (convert_job { :name "RunLater" :when "2012-05-06T06:15:42.215Z" :url "www.google.com" :_id "someid"}  )]
    [ (is (contains? doc :_id )) 
      (is (not (= (:when doc) ""))) ] ))


(deftest test_new_doc ;; Test massaging the JSON
  (let [
        doc (to-json { :name "RunLater" :when "2012-05-06T06:15:42.215Z" :url "www.google.com" :method "POST" :headers {} :interval "2 hours" }  )
		apiuser (read-json (:body (usertests/create_user)))
		apikeys (read-json (:body (usertests/test_apikey (:_id apiuser) )))
        headers { :runlater_key (:public apikeys) :runlater_hash (hmac (:private apikeys) doc ) }
       ]
    (do
      (try  (new_doc doc (:_id apiuser) headers )  
       (catch Exception e (is false (str "Should NOT throw an HMAC Exception " e headers)) ))
      ; Bad Hashes should throw an exception
      (try 
	  	(do (new_doc doc (:_id apiuser) (assoc headers :runlater_hash "bogus") ) (is false "Should throw an HMAC Exception") )
      (catch Exception e ( is (= (.getLocalizedMessage e)  "Invalid HMAC Hash"))))
      ; Must have the key specified 
      (try 
	  	(do 
			(new_doc doc (:_id apiuser) (dissoc headers :runlater_key) ) (is false "Should throw an HMAC Exception") )
      	(catch Exception e ( is (= (.getLocalizedMessage e)  "Must Specify runlater_key"))))
      ; Must have the hash specified 
      (try (do (new_doc doc (:_id apiuser) (dissoc headers :runlater_hash) ) (is false "Should throw an HMAC Exception") )
       (catch Exception e ( is (= (.getLocalizedMessage e)  "Must supply valid runlater_key and runlater_hash in headers"))))
      ; Should not fail
    )))
