(ns runlater.logs
   (:require [clojure.data.json] [monger.collection :as mc] [monger.json] [monger.joda-time] [runlater.sched :as sched] [runlater.client :as rclient] [clj-time.core :as clj-time] )
   (:use clojure.data.json validateur.validation clj-time.format runlater.utils clojure.walk )
    (:import [org.bson.types ObjectId]
               [com.mongodb DB WriteConcern]))


(defn view [userid apikey req body]
	(do 
		(prn "userid " userid " apikey " apikey )
    	{:status 200 :body (to-json (mc/find-maps "rllogs" { :userid userid :runlater_key apikey }  )) } ))


