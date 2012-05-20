(ns runlater.test.jobs
  (:use [runlater.jobs ])
  (:use [clojure.test]))

(deftest test_assert ;; Test parsing the JSON
  ;                                           YYYY-MM-DDTHH:MM:SS.SSSZ
  [ (is ( assert_task { :name "RunLater" :when "2012-05-06T06:15:42.215Z" :url "www.google.com" :interval "2 hours" } )  " A Good Assert")
   (is ( not (assert_task { :name "RunLater" :when "2012-05-06T06:15:42.215Z" :interval "3 hours" } ))  " Mising a key")
    (is (not  (assert_task { :name "RunLater" :when "2012-05-06T06:15:42.215Z" :other "Stuff" :interval "4 minutes"} ))  "Wrong Key ") ])


(deftest test_conversion ;; Test massaging the JSON
  (let [doc (convert { :name "RunLater" :when "2012-05-06T06:15:42.215Z" :url "www.google.com" :_id "someid"}  )]
    [ (is (contains? doc :_id )) 
      (is (not (= (:when doc) ""))) ] ))
