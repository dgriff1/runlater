import httplib, urllib
import json
import hmac
import hashlib
import base64

headers = {"Content-type": "application/json",
    "Accept": "application/json"}

conn = httplib.HTTPConnection("localhost", 5000)

data = { "first" : "Dan", "last" : "Griffin", "email" : "test@runlater.com", "password" : "pass", "company" : "runlater" } 
json_data = json.dumps(data)
conn.request("PUT", "/users/", json_data, headers )
response = conn.getresponse()
json_resp = response.read()
print "Create a user ", response.status, response.reason, json_resp

js = json.loads(json_resp)
conn.request("GET", "/users/" + js["_id"] + "/apikeys/", "", headers)
response = conn.getresponse()
api_resp = response.read()
print "Empty API Keys  ", response.status, response.reason, api_resp

conn.request("PUT", "/users/" + js["_id"] + "/apikeys/prodkey", "", headers)
response = conn.getresponse()
api_resp = json.loads(response.read())
print "Create API Key ", response.status, response.reason, api_resp

api_public_key  = api_resp["public"]
api_private_key  = api_resp["private"]

conn.request("GET", "/users/" + js["_id"] + "/apikeys/", "", headers)
response = conn.getresponse()
api_resp = response.read()
print "Created API Keys  ", response.status, response.reason, api_resp

json_data = json.dumps(data)
conn.request("GET", "/users/"+ json.loads(json_resp)["_id"] , json_data, headers )
response = conn.getresponse()
print "Lookup a user ", response.status, response.reason, response.read()

data = { "name" : "Daily Backup", "when" : "2012-05-06T06:15:42.215Z", "interval" : "2 hours", "url" : "http://google.com", "method" : "POST", "headers" : {}  }
json_data = json.dumps(data)

print "SHA1 ", base64.b64encode( hmac.new(str( api_private_key ), json_data, hashlib.sha1).digest() )
print "EMPTY SHA1 ", base64.b64encode( hmac.new(str( api_private_key ) , "", hashlib.sha1).digest() )


spec_headers = { "runlater_key" : api_public_key, "runlater_hash" : base64.b64encode( hmac.new(str(api_private_key), json_data, hashlib.sha1).digest()) , "Content-Type" : "application/json" } 
conn.request("PUT", "/jobs/", json_data, spec_headers )
response = conn.getresponse()
print "Create a job ", response.status, response.reason, response.read()

#conn.request("GET", "/jobs/" , headers = spec_headers)
#response = conn.getresponse()
#as_str = response.read()
#print "json ", json.loads(as_str)

#conn.request("PUT", "/jobs/", json.dumps(data), headers = spec_headers)
#response = conn.getresponse()
#doc = json.loads(response.read())
#print response.status, response.reason, doc

#conn.request("DELETE", "/jobs/" + doc["_id"])
#response = conn.getresponse()
#print response.status, response.reason, response.read()

conn.request("DELETE", "/users/" + js["_id"] + "/apikeys/"+api_public_key, "", headers)
response = conn.getresponse()
api_resp = response.read()
print "DELETE API Key ", response.status, response.reason, api_resp

conn.request("GET", "/users/" + js["_id"] + "/apikeys/", "", headers)
response = conn.getresponse()
api_resp = response.read()
print "Deleted API Keys  ", response.status, response.reason, api_resp
