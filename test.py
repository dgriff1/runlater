import httplib, urllib
import json
import hmac
import hashlib
import base64
import pyrunlater 
from datetime import datetime
import time

import pymongo

print "Running RunLater Tests"

conn = pymongo.Connection("localhost", 27017 )
conn.runlater.rlusers.remove({})
conn.runlater.rljobs.remove({})
conn.rulnlater.rllogs.remove({})


headers = {"Content-type": "application/json",
    "Accept": "application/json"}

conn = httplib.HTTPConnection("localhost", 5000)

# test_invalid_password
data = { "first" : "Dan", "last" : "Griffin", "email" : "test@runlater.com", "password" : "", "company" : "runlater" } 
json_data = json.dumps(data)
conn.request("PUT", "/users/", json_data, headers )
response = conn.getresponse()
json_resp = response.read()
js = json.loads(json_resp)
assert response.status == 400, js
assert "error" in js, js
assert "Invalid password" in js["error"], js 



# test_create_user
data = { "first" : "Dan", "last" : "Griffin", "email" : "test@runlater.com", "password" : "pass", "company" : "runlater" } 
json_data = json.dumps(data)
conn.request("PUT", "/users/", json_data, headers )
response = conn.getresponse()
json_resp = response.read()
js = json.loads(json_resp)
assert response.status == 201, js
assert "_id" in js, js

USER_ID = js["_id"] 


# test_dup_user
json_data = json.dumps(data)
conn.request("PUT", "/users/", json_data, headers )
response = conn.getresponse()
json_resp = response.read()
js = json.loads(json_resp)
assert response.status == 400
assert "error" in js.keys()
assert "duplicated email" in js["error"]


# test_no_password
#headers["runlater_password"] = "pass"
conn.request("GET", "/users/" + USER_ID + "/apikeys/", "", headers)
response = conn.getresponse()
js = json.loads(response.read())
#print "Empty API Keys  ", response.status, response.reason, api_resp
assert response.status == 400, js
assert  "error" in js, js 
assert "Invalid password" in js["error"], js

# test_no_api_keys
headers["runlater_password"] = "pass"
conn.request("GET", "/users/" + USER_ID + "/apikeys/", "", headers)
response = conn.getresponse()
js = json.loads(response.read())
#print "Empty API Keys  ", response.status, response.reason, api_resp
assert response.status == 200, js
assert  js == [], js 

# test_create_api_key
conn.request("PUT", "/users/" + USER_ID + "/apikeys/prodkey", "", headers)
response = conn.getresponse()
api_resp = json.loads(response.read())
#print "Create API Key ", response.status, response.reason, api_resp
assert "public" in api_resp
assert "private" in api_resp
assert api_resp["public"] == "prodkey"
assert response.status == 201

api_public_key  = api_resp["public"]
api_private_key  = api_resp["private"]

# test_create_duplicate_api_key
conn.request("PUT", "/users/" + USER_ID + "/apikeys/prodkey", "", headers)
response = conn.getresponse()
api_resp = json.loads(response.read())
assert response.status == 400, api_resp
assert "already created" in api_resp["error"], api_resp


# test_find_created_key
conn.request("GET", "/users/" + USER_ID + "/apikeys/", "", headers)
response = conn.getresponse()
js = json.loads(response.read())
# print "List all API Keys ", response.status, response.reason, api_resp
assert len(js) > 0, js
assert api_public_key in js, js
assert response.status == 200, js 

json_data = json.dumps(data)
conn.request("GET", "/users/"+ USER_ID , json_data, headers )
response = conn.getresponse()
api_resp = json.loads( response.read() )
# print "Lookup a user ", response.status, response.reason, api_resp
assert response.status == 200
assert "_id" in api_resp


SERVER = pyrunlater.ServerConnection( USER_ID, api_public_key, api_private_key)

# test_create_job
job = SERVER.createJob("Daily Backup", "2012-09-08T06:15:42.215Z", "2 hours", "http://google.com", "POST", {})

assert job.name == "Daily Backup"
assert job.when == "2012-09-08T06:15:42.215Z"
assert job.interval == {"hours" : 2}
assert job.url == "http://google.com"
assert job.method == "post"
assert job.headers == {}


job.url = "http://www.facebook.com"

# Test updating job
SERVER.updateJob(job)
assert job.url == "http://www.facebook.com"

# Test  that the job is listed
jobs = SERVER.viewJobs()
assert len(jobs) == 1
j = jobs[0]
assert j.name == job.name

# test viewing an individual job
j2 = SERVER.viewJob(job._id)
assert j2._id == j._id
assert j2.name == j.name

try:
	j2 = SERVER.viewJob("504cc30f30049e1c0a3326f6")
	assert False # should raise exception
except Exception, e:
	assert "error" in str(e)
	pass


for i in range(5):
	logs = SERVER.getLogs()
	if len(logs):
		break
	time.sleep(1)
	
assert len(logs) == 1
log = logs[0]
assert log.jobid == j._id
assert log.userid == USER_ID
assert log.runlater_key == api_public_key
began  = datetime.strptime( log.began, "%Y-%m-%dT%H:%M:%S.%f-06:00" ) 
ended = datetime.strptime( log.ended, "%Y-%m-%dT%H:%M:%S.%f-06:00" ) 
assert began < ended
assert log.scheduled == j.when

# test deleting a job
SERVER.deleteJob(job)
jobs = SERVER.viewJobs()
assert len(jobs) == 0

# test_delete_api_key_bad_key
conn.request("DELETE", "/users/" + USER_ID + "/apikeys/"+"fake_api_key", "", headers)
response = conn.getresponse()
js = json.loads(response.read())
assert response.status == 400, js
assert "Not Found" in js["error"], js

# test_delete_api_key
conn.request("DELETE", "/users/" + USER_ID + "/apikeys/"+api_public_key, "", headers)
response = conn.getresponse()
resp = response.read()
js = json.loads(resp)
assert response.status == 200 

# test_double_delete_api_key
conn.request("DELETE", "/users/" + USER_ID + "/apikeys/"+api_public_key, "", headers)
response = conn.getresponse()
resp = response.read()
js = json.loads(resp)
assert response.status == 400 
assert "Not Found" in js["error"]

conn.request("GET", "/users/" + USER_ID + "/apikeys/", "", headers)
response = conn.getresponse()
api_resp = response.read()
assert response.status == 200
assert api_resp == "[]"

print "All assertions passed"
