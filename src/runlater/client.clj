(ns runlater.client
  (:use [clojure.contrib.str-utils :only (str-join)])  
  (:import (javax.crypto Mac)
           (javax.crypto.spec SecretKeySpec)
           ( java.security MessageDigest ) 
            ))

(defn hmac 
  "Calculate HMAC signature for given data."
  [^String key ^String data]
  (let [hmac-sha1 "HmacSHA1"
        signing-key (SecretKeySpec. (.getBytes key) hmac-sha1)
        mac (doto (Mac/getInstance hmac-sha1) (.init signing-key))]
    (String. (org.apache.commons.codec.binary.Base64/encodeBase64 
              (.doFinal mac (.getBytes data)))
             "UTF-8")))
( defn gensha
  "Generates a SHA-256 hash of the given input plaintext."
  [input]
  (let [md (MessageDigest/getInstance "SHA-256")]
    (. md update (.getBytes input))
    (let [digest (.digest md)]
      (str-join "" (map #(Integer/toHexString (bit-and % 0xff)) digest)))))


