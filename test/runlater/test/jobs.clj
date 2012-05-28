(ns runlater.test.jobs
  (:use [runlater.jobs ] [runlater.client] [runlater.utils] )
  (:use [clojure.test] ))

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
        headers { :runlater_key "1234" :runlater_hash (hmac "1234" doc ) }
       ]
    [ 
      ; Bad Hashes should throw an exception
      (try [ (new_doc doc (assoc headers :runlater_hash "bogus") ) (is false "Should throw an HMAC Exception") ]
      (catch Exception e ( is (= (.getLocalizedMessage e)  "Invalid HMAC Hash"))))
      ; Must have the key specified 
      (try [ (new_doc doc (dissoc headers :runlater_key) ) (is false "Should throw an HMAC Exception") ]
      (catch Exception e ( is (= (.getLocalizedMessage e)  "Must Specify runlater_key and runlater_hash in headers"))))
      ; Must have the hash specified 
      (try [ (new_doc doc (dissoc headers :runlater_hash) ) (is false "Should throw an HMAC Exception") ]
      (catch Exception e ( is (= (.getLocalizedMessage e)  "Must Specify runlater_key and runlater_hash in headers"))))
      ; Should not fail
      (try  (new_doc doc headers )  
      (catch Exception e (is false (str "Should NOT throw an HMAC Exception " e)) ))
    ]))
