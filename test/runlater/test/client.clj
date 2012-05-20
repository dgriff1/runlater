(ns runlater.test.client
  (:use [runlater.client])
  (:use [clojure.test]))

(deftest test_split ;; Test parsing the JSON
  [ 
  (is (= (hmac "pizza" "2 hOurs") "MU2BRka4KIkm4n0ApvfN5kziDpk="  ))
])

