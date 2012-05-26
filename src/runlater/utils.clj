(ns runlater.utils
(:use clojure.data.json))


(defn safe_assoc [m k v]
  (if (contains? m k) m (assoc m k v)))

(defn to-json [objs]
    (if (seq? objs)
      (json-str (for [o objs]
        (if (contains? o :_id )
          o
          (assoc o :_id (.toString (:_id o))))))
      (json-str objs)))



