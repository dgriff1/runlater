(ns runlater.test.jobs
  (:use [runlater.jobs ] [runlater.client] [runlater.utils]  )
  (:require [runlater.test.users :as usertests] )
  (:use [clojure.test] [clojure.data.json] ))

(deftest test_assert ;; Test parsing the JSON
  ;                                           YYYY-MM-DDTHH:MM:SS.SSSZ
  [ (is ( assert_task { :name "RunLater" :when "2012-05-06T06:15:42.215Z" :url "www.google.com" :interval "2 hours" :headers {} :body "" :method "GET" } )  " A Good Assert")
   (is ( not (assert_task { :name "RunLater" :when "2012-05-06T06:15:42.215Z" :interval "3 hours" } ))  " Mising a key")
    (is (not  (assert_task { :name "RunLater" :when "2012-05-06T06:15:42.215Z" :other "Stuff" :interval "4 minutes"} ))  "Wrong Key ") ])


(deftest test_conversion ;; Test massaging the JSON
  (let [doc (convert { :name "RunLater" :when "2012-05-06T06:15:42.215Z" :url "www.google.com" :_id "someid"}  )]
    [ (is (contains? doc :_id )) 
      (is (not (= (:when doc) ""))) ] ))


(deftest test_new_doc ;; Test massaging the JSON
  (let [
        doc (to-json { :name "RunLater" :when "2012-05-06T06:15:42.215Z" :url "www.google.com" }  )
		apikeys (read-json (:body (usertests/test_apikey)))
        headers { :runlater_key (:public apikeys) :runlater_hash (hmac (:private apikeys) doc ) }
       ]
    (do
      (try  (new_doc doc headers )  
       (catch Exception e (is false (str "Should NOT throw an HMAC Exception " e headers)) ))
      ; Bad Hashes should throw an exception
      (try 
	  	(do (new_doc doc (assoc headers :runlater_hash "bogus") ) (is false "Should throw an HMAC Exception") )
      (catch Exception e ( is (= (.getLocalizedMessage e)  "Invalid HMAC Hash"))))
      ; Must have the key specified 
      (try 
	  	(do 
			(new_doc doc (dissoc headers :runlater_key) ) (is false "Should throw an HMAC Exception") )
      	(catch Exception e ( is (= (.getLocalizedMessage e)  "Must Specify runlater_key"))))
      ; Must have the hash specified 
      (try (do (new_doc doc (dissoc headers :runlater_hash) ) (is false "Should throw an HMAC Exception") )
      (catch Exception e ( is (= (.getLocalizedMessage e)  "Must supply valid runlater_key and runlater_hash in headers"))))
      ; Should not fail
    )))
