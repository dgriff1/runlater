(ns runlater.runner
 (:require [clojure.data.json] [monger.collection :as mc] [monger.json]
         [monger.joda-time] [runlater.sched :as sched]  [runlater.utils]  )
            )

(def main_poller (agent { } ) )

(defn watch_run [k v new_state old_state ] 
	(prn "Ran job ") new_state)

(defn run_job [ j ] 
	(prn "running " j ) j )

(defn launch_jobs [ s jobs ] 
	(if (> (count jobs) 0)
		(let [j (first jobs) j_agent (agent j)  ]
			(do 
				(prn "Launching " j )
				(add-watch j_agent :runner watch_run)
				(send j_agent run_job) 
				(launch_jobs (assoc s (:_id j) j_agent ) (rest jobs) )))
		s))

(defn poll [ s ] 
	(let [jobs_to_run  (mc/find-maps "rljobs" { :when { "$lt" (java.util.Date.) }}) ]  
		(do (prn "Polling for " jobs_to_run)
			(launch_jobs s jobs_to_run)
		)))

(defn watch_poller [k v new_state old_state ] 
	(prn "Polled ") (Thread/sleep 1000) (send-off main_poller poll) )
(add-watch main_poller :poller watch_poller)

	



	

(defn launch_poller [] 
	(send-off main_poller poll))
