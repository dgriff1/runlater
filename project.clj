(defproject runlater "1.0.0-SNAPSHOT"
  :description "A RESTful scheduler "
    :dependencies [[org.clojure/clojure "1.3.0"]
                     [compojure "1.0.1"]
                     [org.clojure/data.json "0.1.2"]
                     [com.novemberain/monger "1.0.0-beta4"]
                     [ring/ring-jetty-adapter "1.0.1"]
                     [lein-ring "0.5.4"]
                      ]
                     :dev-dependencies [[lein-ring "0.5.4"]]
                     :ring {:handler runlater.core/app})

