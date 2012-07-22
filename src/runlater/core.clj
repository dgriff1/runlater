(ns runlater.core
 (:use compojure.core [ring.adapter.jetty :only [run-jetty]] )
    (:require [compojure.route :as route]
              [monger core util]
              [compojure.handler :as handler]
              [runlater.jobs :as jobs ]
              [runlater.users :as users ] ))



(defroutes main-routes
  ; what's going on
  (PUT "/users/:userid/jobs/" { {userid :userid} :params  body :body :as request}  (jobs/create userid request body ) )
  (GET "/users/:userid/jobs/" { {userid :userid} :params  body :body :as request} (jobs/index userid request body) )
  ; resource actions 
  (GET "/users/:userid/jobs/:jobid" { {userid :userid} :params {id :jobid} :params  body :body :as request }  (jobs/lookup id userid request body) )
  (PUT "/users/:userid/jobs/:jobid" { {userid :userid} :params {id :jobid} :params  body :body :as request }  (jobs/edit id userid request body) )
  (DELETE "/users/:userid/jobs/:jobid" { {userid :userid} :params {id :jobid} :params  body :body :as request }  (jobs/delete id userid request body) )

  (GET "/users" [] (users/index) )
  (PUT "/users/" { body :body :as request}  (users/create request body ) )
  ; resource actions 
  (GET "/users/:id" { {id :id} :params  params :params  body :body }  (users/lookup id params body) )
  (PUT "/users/:id" { {id :id} :params  params :params  body :body }  (users/edit id params body) )
  (DELETE "/users/:id" { {id :id} :params  params :params  body :body }  (users/delete id params body) )

  (GET "/users/:id/apikeys/" { {id :id} :params  params :params  body :body }  (users/lookup_apikeys id params body) )
  (PUT "/users/:id/apikeys/:apikeyname" { {id :id} :params {apikeyname :apikeyname } :params params :params  body :body }  (users/create_apikey id apikeyname params body) )
  (DELETE "/users/:id/apikeys/:otherid" { {id :id} :params {keyname :otherid} :params params :params  body :body }  (users/delete_apikey id keyname params body) )

  
  ; fall backs 
  (route/resources "/")
  (route/not-found "Page not found")   )
             

                          
; (prn (monger.core/connect! { :host "ds033067.mongolab.com" :port 33067 } ) )
(prn (monger.core/connect! { :host "127.0.0.1" :port 27017} ) )

; (prn (monger.core/authenticate "heroku_app4267510" "heroku_app4267510" (.toCharArray "pesafn60hcjm4sms7c7mt6frr9")))

; (prn (monger.core/set-db! (monger.core/get-db "heroku_app4267510")))
(prn (monger.core/set-db! (monger.core/get-db "runlater")))


(def app
  (handler/api main-routes))


(defn -main [port]
  (run-jetty app {:port (Integer. port)}))

(defn polling_func [] 
  :do_shit )

(def poller (agent {} ))

(defn start_poller [] 
  (send-off poller polling_func))

    





