(ns runlater.test.users
  (:use [runlater.users ] [runlater.client] [runlater.utils] [clojure.data.json] )
  (:use [clojure.test] [clojure.java.io ] ))

(deftest test_assert ;; Test parsing the JSON
  ;                                           YYYY-MM-DDTHH:MM:SS.SSSZ
  [ (is ( assert_user { :first "Dan" :last"Griffin" :email "test@runlater.com" :company "Run Later" :password "pass" } )  " A Good Assert")
   (is ( not (assert_user  { :first "Dan" :last"Griffin" :email "test@runlater.com" :password "pass"  }))  " Mising a key")
    (is (not  (assert_user { :first "Dan" :last"Griffin" :email "test@runlater.com" :otherbb "crap" :password "pass" }  ))  "Wrong Key ") ])


(deftest test_conversion ;; Test massaging the JSON
  (let [doc (convert { :first "Dan" :last"Griffin" :email "test@runlater.com" :company "Run Later" :password "pass" }  )]
    (do (is (contains? doc :_id ))
      (is (get doc :_id) "test@runlater.com")
      (is (= (get doc :apikeys) {}) "test@runlater.com")
      (is (not (= (get doc :password) "pass")))
      doc ) ))

(defn test_apikey [] ;; Test creating an API Key 
	(create_apikey (get (read-json (:body (create { :headers {} } (java.io.StringReader. (to-json { :first "Dan" :last"Griffin" :email (str (random-string 24) "@runlater.com") :company "Run Later" :password "pass" }))))) :_id ) "production" nil nil))

			

;(deftest test_new_doc ;; Test massaging the JSON
;  (let [
;        doc (to-json { :name "RunLater" :when "2012-05-06T06:15:42.215Z" :url "www.google.com" }  )
;        headers { :runlater_key "1234" :runlater_hash (hmac "1234" doc ) }
;       ]
;    [ 
;      ; Bad Hashes should throw an exception
;      (try [ (new_doc doc (assoc headers :runlater_hash "bogus") ) (is false "Should throw an HMAC Exception") ]
;      (catch Exception e ( is (= (.getLocalizedMessage e)  "Invalid HMAC Hash"))))
;      ; Must have the key specified 
;      (try [ (new_doc doc (dissoc headers :runlater_key) ) (is false "Should throw an HMAC Exception") ]
;      (catch Exception e ( is (= (.getLocalizedMessage e)  "Must Specify runlater_key and runlater_hash in headers"))))
;      ; Must have the hash specified 
;      (try [ (new_doc doc (dissoc headers :runlater_hash) ) (is false "Should throw an HMAC Exception") ]
;     (catch Exception e ( is (= (.getLocalizedMessage e)  "Must Specify runlater_key and runlater_hash in headers"))))
;      ; Should not fail
;      (try  (new_doc doc headers )  
;      (catch Exception e (is false (str "Should NOT throw an HMAC Exception " e)) ))
;    ]))
