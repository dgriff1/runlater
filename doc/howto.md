
How RunLater Works

Each organization that uses RunLater will have 1 user account and multiple API accounts. 

The user account consists of a username and password. Using it you can generate API accounts consisting of a key pair and a name.  

Joe's Widgets might consist of:

User Account:
{ 
	account: "joes_web_app"
	email: "joe@joeswidgets.com"
	passwod: (hashed) 
	address: "123 Fake Street"
	state: "Colorado"
	country: "USA"
	postal: "80301"
}

API Accounts:

You should create API accounts for each set of tasks. 
If you are exposing scheduling for each user you should create an API account for that user. 
You should create an account for any special processes such as backups, or billing. 

{ 
	key: "production" 
	secret: "62456bc123edf"
} 

{ 
	key: "backup" 
	secret: "b123c123edf"
} 

Each Job is submitted using the api key, api secret and account name. The api key is specified in the header and the secret is used to compute the HMAC of the body. The account name is embedded in the URL. With these 3 pieces of data and our SSL encryption your data is secure. 

For example, using the above account we can create a job like so: 

PUT to /users/joes_web_app/jobs/ 
with headers  {  "runlater_key" : "backup", "runlater_hash" : base64(hmac(secret, body)),  "Content-Type" : "application/json" }  
and a JSON body  of
	{
            "name" : "trigger backup"
            "when" : "2013-09-08T06:15:42.215Z",
            "interval" : "1 day",
            "url" : "http://joeswebapp.com/processes/backup"
            "method" : "POST",
            "headers" : {  "authid" : 123456 }",
   	}


Certain API actions don't have bodies, in which case you will hash the URL. 

DELETE to /users/joes_web_app/jobs/50c2d4b33004a1f2abfaea10
with headers  {  "runlater_key" : "backup", "runlater_hash" : base64(hmac(secret,"/users/joes_web_app/jobs/50c2d4b33004a1f2abfaea10" )),  "Content-Type" : "application/json" }  

Below are the URL's related to Jobs and Logs. 

Create a Job
PUT "/users/:account/jobs/" 
Get all the Jobs for an API Key 
GET "/users/:account/apikey/:apikey/jobs/" 

Get a specific Job
GET "/users/:account/jobs/:jobid" 
Update a specific Job
PUT "/users/:account/jobs/:jobid" 
Delete that Job
DELETE "/users/:account/jobs/:jobid" 

View logs
GET "/users/:account/logs/:apikey" 






