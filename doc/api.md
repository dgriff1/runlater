
Using the API. 

Access: 
For User and API Account Management 
- Set runlater_user and runlater_password in the request headers. 
- The connection is accessed over SSL.  

For Job Scheduling, Editting and Logging
- Set runlater_key in the request headers. Runlater_key is the key attribute on the runlater API Account. 
- Set runlater_hash in the request headers. Runlater_hash is a base 64 encoded HMAC-SHA1 hash of the request body. 
- For GET and DELETE requests hash the URL i.e. "/jobs/". 


All APIs return or take JSON where appropriate.

Jobs 

GET "/jobs/" returns a JSON list of an API accounts jobs. 
POST "/jobs/" create and schedule a new Job. 
PUT "/jobs/id" edit a Job.
GET "/jobs/id" get a Job. 
DELETE "/jobs/id" delete a Job. 


