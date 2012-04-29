(ns runlater.test.jobs
  (:use [runlater.jobs ])
  (:use [clojure.test]))

(deftest test_assert ;; Test parsing the JSON
  ;                                           YYYY-MM-DDTHH:MM:SS.SSSZ
  [ (is ( assert_task { :name "RunLater" :when "2012-10-24T02:30" :url "www.google.com"} )  " A Good Assert")
   (is ( not (assert_task { :name "RunLater" :when "2012-10-24T02:30" } ))  " Mising a key")
    (is (not  (assert_task { :name "RunLater" :when "2012-10-24T02:30" :other "Stuff"} ))  "Wrong Key ") ])
