import httplib, urllib
import json
import hmac
import hashlib
import base64

class Job(object):
	def __init__(self, **kwargs):
		self.name = kwargs.pop("name", "") # a string
		self._id = kwargs.pop("_id", "") # runlater will generate this
		self.when = kwargs.pop("when", "") # a string repr of the next run time
		self.body = kwargs.pop("body", "") # a string repr of the next run time
		self.interval = kwargs.pop("interval", "") # on create can be a string like "2 hours 4 minutes" afterwards will be { "hours" : 2, "minutes" : 4 }
		self.url = kwargs.pop("url", "") # the URL to call
		self.method = kwargs.pop("method", "") # post/get/delete/put
		self.headers = kwargs.pop("headers", {} ) # HTTP headers to send
		self.status = kwargs.pop("status", {} ) # tracking for runlater
		self.userid = kwargs.pop("userid", {} ) # user who owns this job
		self.doctype = kwargs.pop("doctype", {} ) # always job
		self.runlater_key = kwargs.pop("runlater_key", {} ) # the api key that owns this job
		self.editted = kwargs.pop("editted", {} ) # last edit date can be null for new jobs
		if len(kwargs):
			raise Exception("To many arguments to job : ", kwargs)

	def update(self, **kwargs): 
		for k, v in kwargs.items():
			if not hasattr(self, k):
				raise Exception("Invalid key " + k)
			setattr(self, k, v)
		return self
	
	def toDict(self):
		return { 
			"name" : self.name,
			"_id" : self._id,
			"when" : self.when ,
			"interval" : self.interval ,
			"url" : self.url ,
			"method" : self.method ,
			"headers" : self.headers,
			"status" : self.status,
			"body" : self.body,
			"userid" : self.userid,
			"doctype" : self.doctype,
			"runlater_key" : self.runlater_key
		}

class Log(object):
	def __init__(self, **kwargs):
		for k, v in kwargs.items():
			setattr(self, k, v)

class ServerConnection(object):
	def __init__(self, userid, apikey, apisecret ):
		self.conn = httplib.HTTPConnection("localhost", 5000)
		self.userid = userid
		self.apikey = apikey
		self.apisecret = apisecret

	def genHeaders(self, json_data):
		return { "runlater_key" : self.apikey, "runlater_hash" : base64.b64encode( hmac.new(str(self.apisecret), json_data, hashlib.sha1).digest()) , "Content-Type" : "application/json" }

	def viewJobs(self):
		VIEW_URL = "/users/" + self.userid + "/apikey/" + self.apikey + "/jobs/"
		self.conn.request("GET", VIEW_URL , headers = self.genHeaders(VIEW_URL)  )
		response = self.conn.getresponse()
		if response.status != 200:
			raise Exception("Failed to View Jobs " + response.read() )
		j_list = json.loads( response.read() )
		ret = []
		for j in j_list:
			ret.append(Job(**j))
		return ret
	
	def viewJob(self, jobid):
		VIEW_URL = "/users/" + self.userid + "/jobs/" + str(jobid)
		self.conn.request("GET", VIEW_URL , headers = self.genHeaders(VIEW_URL)  )
		response = self.conn.getresponse()
		if response.status != 200:
			raise Exception("Failed to Find Job " + response.read() )
		j = json.loads( response.read() )
		return Job(**j)

	def createJob(self, name, when, body, interval, url, method, headers ):
		data = { "name" : name, "when" : when, "interval" : interval, "url" : url, "body" : body, "method" : method, "headers" : headers}
		json_data = json.dumps(data)
		self.conn.request("PUT", "/users/"+ str(self.userid) + "/jobs/", json_data, self.genHeaders(json_data) )
		response = self.conn.getresponse()
		if response.status != 201:
			raise Exception("Failed to Create Job " + response.read())
		return Job(**json.loads(response.read()))
	
	def updateJob(self, job):
		if not isinstance(job, Job):
			raise Exception("Must pass in a job")
		data = job.toDict()
		json_data = json.dumps(data)
		self.conn.request("PUT", "/users/"+ str(self.userid) + "/jobs/" + job._id, json_data, self.genHeaders(json_data) )
		response = self.conn.getresponse()
		if response.status != 200:
			raise Exception("Failed to Update Job " + response.read())
		return job.update(**json.loads(response.read()))

	def deleteJob(self, job):
		if not isinstance(job, Job):
			raise Exception("Must pass in a job")
		DELETE_URL =  "/users/" + self.userid + "/jobs/"+ job._id
		self.conn.request("DELETE", DELETE_URL , headers = self.genHeaders(DELETE_URL) )
		response = self.conn.getresponse()
		if response.status != 200:
			raise Exception("Failed to Delete Job " + response.read())
		as_str = response.read()

	def getLogs(self):
		VIEW_URL = "/users/" + self.userid + "/logs/" + self.apikey
		self.conn.request("GET", VIEW_URL , headers = self.genHeaders(VIEW_URL)  )
		response = self.conn.getresponse()
		r = response.read()
		l_list = json.loads( r )
		ret = []
		for l in l_list:
			ret.append(Log(**l))
		return ret	
