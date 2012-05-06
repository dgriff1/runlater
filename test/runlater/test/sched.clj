(ns runlater.test.sched
  (:use [runlater.sched ])
  (:use [clojure.test]))

(deftest test_split ;; Test parsing the JSON
  ;                                           YYYY-MM-DDTHH:MM:SS.SSSZ
  [ 
  (is (= (split_into_hash "2 hOurs") {:hours 2}  ))
  (is (= (split_into_hash "2 hours 4 minuTes") {:hours 2 :minutes 4}  ))
])

