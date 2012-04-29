import httplib, urllib
import json

headers = {"Content-type": "application/json",
    "Accept": "application/json"}

conn = httplib.HTTPConnection("localhost", 3000)

data = { "name" : "Daily Backup", "when" : "2012-5-1 12:30:45", "interval" : "2 hours", "url" : "http://google.com" }

conn.request("PUT", "/jobs/", json.dumps(data))
response = conn.getresponse()
print response.status, response.reason, json.loads(response.read())

conn.request("GET", "/jobs/" )
response = conn.getresponse()
as_str = response.read()
print "json ", json.loads(as_str)


conn.request("PUT", "/jobs/", json.dumps(data))
response = conn.getresponse()
doc = json.loads(response.read())
print response.status, response.reason, doc

conn.request("DELETE", "/jobs/" + doc["_id"])
response = conn.getresponse()
print response.status, response.reason, response.read()
