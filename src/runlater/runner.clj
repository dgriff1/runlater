(ns runlater.runner
 (:require [clojure.data.json] [monger.collection :as mc] [monger.json]
         [monger.joda-time] [clj-time.core] [runlater.sched :as sched]  [runlater.utils] [clj-http.client :as client] )
            )

(def main_poller (agent { } ) )

(defn watch_run [k v old_state new_state ] 
	(do
		(prn "Ran job " new_state " -- " old_state) 
		(let [end (clj-time.core/now)] 
			(mc/insert "rllogs" { 
				:jobid (:_id old_state) 
				:userid (:userid old_state)
				:runlater_key (:runlater_key old_state)
				:result (:resp new_state)
				:began (:began new_state) 
				:scheduled (:when old_state) 
				:ended end
				} ) 
		(mc/save "rljobs" (sched/reschedule old_state )))
		new_state))

(defn run_job [ j ] 
	(try 
		(let [ began (clj-time.core/now) ] 
		(if (= (keyword (:method j)) :get)  
			{ :began began :resp (client/request 
				{ 
					:url	(:url j)  
					:method :get
					:headers (get j :headers {})
			})}
			{ :began began :resp (client/request
				{
					:url	(:url j)  
					:method (keyword (get j :method :post) )
					:body (get :body j "") 
					:headers (get j :headers {})
			})} )) 
		(catch Exception e  
			(str e) ))
		)

(defn launch_jobs [ s jobs ] 
	(if (> (count jobs) 0)
		(let [j (assoc (first jobs) :status "running") j_agent (agent j)  ]
			(do 
				(mc/save "rljobs" j)
				(add-watch j_agent :runner watch_run)
				(send j_agent run_job) 
				(launch_jobs (assoc s (:_id j) j_agent ) (rest jobs) )))
		s))

(defn poll [ s ] 
	(let [jobs_to_run  (mc/find-maps "rljobs" { :when { "$lt" (java.util.Date.) } :status "waiting" }) ]  
			(launch_jobs s jobs_to_run)
		))

(defn watch_poller [k v old_state new_state ] 
	(prn "Polled ") (Thread/sleep 1000) (send-off main_poller poll) )

(add-watch main_poller :poller watch_poller)

	
(defn launch_poller [] 
	(send-off main_poller poll))
