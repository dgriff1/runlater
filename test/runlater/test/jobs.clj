(ns runlater.test.jobs
  (:use [runlater.jobs ])
  (:use [clojure.test]))

(deftest test_assert ;; Test parsing the JSON
  ;                                           YYYY-MM-DDTHH:MM:SS.SSSZ
  [ (is ( assert_task { :name "RunLater" :when "2012-10-24T02:30" :url "www.google.com" :interval "2 hours" } )  " A Good Assert")
   (is ( not (assert_task { :name "RunLater" :when "2012-10-24T02:30" :interval "3 hours" } ))  " Mising a key")
    (is (not  (assert_task { :name "RunLater" :when "2012-10-24T02:30" :other "Stuff" :interval "4 minutes"} ))  "Wrong Key ") ])


(deftest test_conversion ;; Test massaging the JSON
  (let [doc (convert (to-json { :name "RunLater" :when "2012-10-24T02:30" :url "www.google.com" :_id "someid"}  ))]
    [ (is (not (= (:_id doc) "someid" ))) 
      (is (not (= (:when doc) ""))) ] ))
