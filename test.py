import httplib, urllib
import json
import hmac
import hashlib
import base64
import pyrunlater 
import time

headers = {"Content-type": "application/json",
    "Accept": "application/json"}

conn = httplib.HTTPConnection("localhost", 5000)

data = { "first" : "Dan", "last" : "Griffin", "email" : "test@runlater.com", "password" : "pass", "company" : "runlater" } 
json_data = json.dumps(data)
conn.request("PUT", "/users/", json_data, headers )
response = conn.getresponse()
json_resp = response.read()
js = json.loads(json_resp)
#print "Create a user ", response.status, response.reason, json_resp

assert response.status == 201
assert "_id" in js

USER_ID = js["_id"] 

conn.request("GET", "/users/" + USER_ID + "/apikeys/", "", headers)
response = conn.getresponse()
api_resp = json.loads(response.read())
#print "Empty API Keys  ", response.status, response.reason, api_resp
assert  api_resp == []
assert response.status == 200

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

conn.request("GET", "/users/" + USER_ID + "/apikeys/", "", headers)
response = conn.getresponse()
api_resp = response.read()
# print "List all API Keys ", response.status, response.reason, api_resp
assert len(api_resp) > 0 
assert "prodkey" in api_resp
assert response.status == 200

json_data = json.dumps(data)
conn.request("GET", "/users/"+ USER_ID , json_data, headers )
response = conn.getresponse()
api_resp = json.loads( response.read() )
# print "Lookup a user ", response.status, response.reason, api_resp
assert response.status == 200
assert "_id" in api_resp


######### 
# MAKE A JOB USING RUNLATER.py
#
#
#########
print "Server ", pyrunlater.ServerConnection
SERVER = pyrunlater.ServerConnection( USER_ID, api_public_key, api_private_key)

# test creating a job
job = SERVER.createJob("Daily Backup", "2012-09-08T06:15:42.215Z", "2 hours", "http://google.com", "POST", {})

print "Interval ", job.when
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

time.sleep(3)

logs = SERVER.getLogs()
assert len(logs) == 1
log = logs[0]
assert log.jobid == j._id
assert log.userid == USER_ID
assert log.runlater_key == api_public_key

# test deleting a job
SERVER.deleteJob(job)
jobs = SERVER.viewJobs()
assert len(jobs) == 0

conn.request("DELETE", "/users/" + USER_ID + "/apikeys/"+api_public_key, "", headers)
response = conn.getresponse()
api_resp = response.read()
print "DELETE API Key ", response.status, response.reason, api_resp
assert response.status == 200 
assert "Deleted" in api_resp

conn.request("GET", "/users/" + USER_ID + "/apikeys/", "", headers)
response = conn.getresponse()
api_resp = response.read()
print "Deleted API Keys  ", response.status, response.reason, api_resp
assert response.status == 200
assert api_resp == "[]"
