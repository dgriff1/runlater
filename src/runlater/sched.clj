(ns runlater.sched
  (:use [clojure.string :only [split lower-case] ] )
  (:require [clj-time.core])
  (:import (java.util.regex Pattern) ( clojure.lang IPersistentMap ISeq)  ))


(defn next_run [ current interval ] 
	(let [ next_time (clj-time.core/plus current 
		(clj-time.core/secs  (get interval :seconds 0)) 	
		(clj-time.core/minutes  (get interval :minutes 0)) 	
		(clj-time.core/hours  (get interval :hours 0)) 	
		(clj-time.core/days (get interval :days 0)) 	
		(clj-time.core/weeks (get interval :weeks 0)) 	
		(clj-time.core/months (get interval :months 0)) 	)]
		(do 
			(prn "Next Time " next_time)
			(if (clj-time.core/before? next_time (clj-time.core/now) ) 
				(next_run next_time interval)
				next_time
		 	))))

(defn reschedule [j]
	(do 
		(prn "J " (:interval j) " -- " (= ((:interval j) {})))
	( if (= (:interval j) {}) 
		(assoc j :status "completed")
		(-> 
			(assoc j :status "waiting") 
			(assoc :when (next_run (:when j) (:interval j))))
    )))

(def SPACEREGEX (Pattern/compile " "))

(defn increment [m k v] (if (contains? m k)
                          (assoc m k (+ v (get m k)))
                          (assoc m k v)))


(defn convert_to_hash [intervals times ]
    (let [gap (first intervals) tag (second intervals) ] 
      (if (and tag gap) 
        (convert_to_hash (rest (rest intervals)) (increment times (keyword tag) (Integer/parseInt gap) ) )
        times  )
    )
)

(defn split_into_hash  [^String interval]  (convert_to_hash (split (lower-case interval) SPACEREGEX) (hash-map) ) )
  
