(ns runlater.sched
  (:use [clojure.string :only [split lower-case] ] )
  (:import (java.util.regex Pattern) ( clojure.lang IPersistentMap ISeq)  ))



(defn next_run [now interval]
  "OK" 
    )

(def SPACEREGEX (Pattern/compile " "))

  



(defn convert_to_hash [intervals times ]
    (let [gap (first intervals) tag (second intervals) ] 
      (if (and tag gap) 
        (convert_to_hash (rest (rest intervals)) (assoc times (keyword tag) (Integer/parseInt gap) ) )
        times  )
    )
)

(defn split_into_hash  [^String interval]  (convert_to_hash (split (lower-case interval) SPACEREGEX) (hash-map) ) )
  
