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
js = json.loads(json_resp)
print "Create a user ", response.status, response.reason, json_resp

assert response.status == 201
assert "_id" in js

USER_ID = js["_id"] 

conn.request("GET", "/users/" + USER_ID + "/apikeys/", "", headers)
response = conn.getresponse()
api_resp = json.loads(response.read())
print "Empty API Keys  ", response.status, response.reason, api_resp
assert  api_resp == []
assert response.status == 200

conn.request("PUT", "/users/" + USER_ID + "/apikeys/prodkey", "", headers)
response = conn.getresponse()
api_resp = json.loads(response.read())
print "Create API Key ", response.status, response.reason, api_resp
assert "public" in api_resp
assert "private" in api_resp
assert api_resp["public"] == "prodkey"
assert response.status == 201

api_public_key  = api_resp["public"]
api_private_key  = api_resp["private"]

conn.request("GET", "/users/" + USER_ID + "/apikeys/", "", headers)
response = conn.getresponse()
api_resp = response.read()
print "List all API Keys ", response.status, response.reason, api_resp
assert len(api_resp) > 0 
assert "prodkey" in api_resp
assert response.status == 200

json_data = json.dumps(data)
conn.request("GET", "/users/"+ USER_ID , json_data, headers )
response = conn.getresponse()
api_resp = json.loads( response.read() )
print "Lookup a user ", response.status, response.reason, api_resp
assert response.status == 200
assert "_id" in api_resp


data = { "name" : "Daily Backup", "when" : "2012-05-06T06:15:42.215Z", "interval" : "2 hours", "url" : "http://google.com", "method" : "POST", "headers" : {}  }
json_data = json.dumps(data)

print "SHA1 ", base64.b64encode( hmac.new(str( api_private_key ), json_data, hashlib.sha1).digest() )
print "EMPTY SHA1 ", base64.b64encode( hmac.new(str( api_private_key ) , "", hashlib.sha1).digest() )


spec_headers = { "runlater_key" : api_public_key, "runlater_hash" : base64.b64encode( hmac.new(str(api_private_key), json_data, hashlib.sha1).digest()) , "Content-Type" : "application/json" } 
conn.request("PUT", "/users/"+ USER_ID + "/jobs/", json_data, spec_headers )
response = conn.getresponse()
JOB = json.loads(response.read())
print "Create a job ", response.status, response.reason, JOB
assert "_id" in JOB
assert "url" in JOB
assert isinstance(JOB["interval"], dict)

JOB["url"] = "www.facebook.com" 
json_data = json.dumps(JOB)
spec_headers = { "runlater_key" : api_public_key, "runlater_hash" : base64.b64encode( hmac.new(str(api_private_key), json_data, hashlib.sha1).digest()) , "Content-Type" : "application/json" } 
conn.request("PUT", "/users/"+ USER_ID + "/jobs/" + JOB["_id"], json_data, spec_headers )
response = conn.getresponse()
JOB = json.loads(response.read())
print "Edit a job ", response.status, response.reason, JOB
assert JOB["url"] == "www.facebook.com"

conn.request("GET", "/users/" + USER_ID + "/jobs/" , headers = spec_headers)
response = conn.getresponse()
as_str = response.read()
print "json ", json.loads(as_str)

#conn.request("PUT", "/jobs/", json.dumps(data), headers = spec_headers)
#response = conn.getresponse()
#doc = json.loads(response.read())
#print response.status, response.reason, doc

#conn.request("DELETE", "/jobs/" + doc["_id"])
#response = conn.getresponse()
#print response.status, response.reason, response.read()

conn.request("DELETE", "/users/" + USER_ID + "/apikeys/"+api_public_key, "", headers)
response = conn.getresponse()
api_resp = response.read()
print "DELETE API Key ", response.status, response.reason, api_resp

conn.request("GET", "/users/" + USER_ID + "/apikeys/", "", headers)
response = conn.getresponse()
api_resp = response.read()
print "Deleted API Keys  ", response.status, response.reason, api_resp
