

A Jobs Structure Consists of a JSON dictionary:

`
{ 
	_id : (string) *only when editting a job* uniquely identifies each job
	name : (string) A name to easily identify the job (uniqueness is not enforced) 
	when : (string) Contains the date-time to run the job (follows ISO8601 ) 
	url : (string) URL to call when job runs.
	method : (string) "POST", "GET", "PUT" or "DELETE", method to use when calling url. 
	interval : (string) A string describing how to re-schedule the job. "" for no rescheduling.
	headers : (dictionary) Headers to send when the job runs. 
	on_failure : (optional)(dictionary)
		{ 
			fail_on : (list of integers) a list of HTTP status codes that denote a failure
			email : (string) email to use for notification
			trigger ; (string) _id of a job to trigger
		}
	body : (optional)(string) Body to send when the job runs. 
}
`

On Security: 

There are few standards on RESTful security. Runlater is designed to trigger actions on your application. We recommend you do the following: 

- Always use SSL. 
- Set the headers for your job to identify your request. Something like { "mykey" : "abc123" } 
- If you are using the body to submit data to your application encrypt the body with HMAC and set the headers appropriately. 


On Failures:

- If "on_failure" is not specified then Jobs with a return code of 500 will create Logs with an error status. 
- If "on_failure" is specified then a Job returns a code in the "fail_on" list then an email will be sent or a job will be triggered.
