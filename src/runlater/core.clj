(ns runlater.core
 (:use compojure.core [ring.adapter.jetty :only [run-jetty]] [clojure.walk :only [keywordize-keys]] )
    (:require [compojure.route :as route]
              [monger core util]
			  [ring.util.response :as resp]
              [compojure.handler :as handler]
              [runlater.jobs :as jobs ]
              [runlater.runner :as runner]
              [runlater.logs :as logs]
              [runlater.users :as users ] ))



(defroutes main-routes
  ; what's going on
  (PUT "/users/:userid/jobs/" { {userid :userid} :params  body :body :as request}  (jobs/create userid (keywordize-keys request)  body ) )
  (GET "/users/:userid/apikey/:apikey/jobs/" { {userid :userid} :params  {apikey :apikey} :params  body :body :as request} (jobs/index userid apikey (keywordize-keys request) body) )
  ; logs
  (GET "/users/:userid/logs/:apikey" { {userid :userid} :params {apikey :apikey} :params  body :body :as request }  (logs/view userid apikey (keywordize-keys request) body) )
  ; resource actions 
  (GET "/users/:userid/jobs/:jobid" { {userid :userid} :params {id :jobid} :params  body :body :as request }  (jobs/lookup id userid (keywordize-keys request) body) )
  (PUT "/users/:userid/jobs/:jobid" { {userid :userid} :params {id :jobid} :params  body :body :as request }  (jobs/edit id userid (keywordize-keys request) body) )
  (DELETE "/users/:userid/jobs/:jobid" { {userid :userid} :params {id :jobid} :params  body :body :as request }  (jobs/delete id userid (keywordize-keys request) body) )

  (GET "/users" [] (users/index) )
  (PUT "/users/" { body :body :as request}  (users/create (keywordize-keys request) body ) )
  ; resource actions 
  (GET "/users/:id" { {id :id} :params  :as req }  (users/lookup id (keywordize-keys req)) )
  (PUT "/users/:id" { {id :id} :params  body :body :as req }  (users/edit id body (keywordize-keys req)) )
  (DELETE "/users/:id" { {id :id} :params  :as req}  (users/delete id (keywordize-keys req)) )

  (GET "/users/:id/apikeys/" { {id :id} :params  :as req }  (users/lookup_apikeys id (keywordize-keys req) ) )
  (PUT "/users/:id/apikeys/:apikeyname" { {id :id} :params {apikeyname :apikeyname } :params body :body :as req}  (users/create_apikey id apikeyname body (keywordize-keys req) ) )
  (DELETE "/users/:id/apikeys/:otherid" { {id :id} :params {keyname :otherid} :params body :body :as req}  (users/delete_apikey id keyname body (keywordize-keys req)) )

  ; fall backs 
  (GET "/" [] (resp/redirect "/index.html"))
  (route/resources "/")
  (route/not-found "Page not found")   )
             

                          
; (prn (monger.core/connect! { :host "ds033067.mongolab.com" :port 33067 } ) )
(prn "Connecting to " (System/getenv "MONGOLAB_URI"))
(prn (monger.core/connect-via-uri! (System/getenv "MONGOLAB_URI" ) ))



(def app
  (handler/api main-routes))


(defn -main [port]
 	(do (runner/launch_poller)
  		(run-jetty app {:port (Integer. port)})))

(defn polling_func [] 
  :do_shit )

(def poller (agent {} ))

(defn start_poller [] 
  (send-off poller polling_func))

    





