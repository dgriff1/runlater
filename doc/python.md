

For your convenience we have written a python helper and a ruby helper. 

The Python wrapper is available here: 

To use it simply import it.  

- import runlater

and using your account name, public and private key create a server connection. 

Server = runlater.ServerConnection( AccountName, APIPublicKey, APIPrivateKey)

The Server has a number of methods for working with Jobs and Logs.  

For example to create a Job
job = Server.createJob("Daily Backup", "2012-09-08T06:15:42.215Z", "", { "hours" : 2 }, "http://google.com", "POST", {}) 

or using the string syntax for specifying interval

job = Server.createJob("Daily Backup", "2012-09-08T06:15:42.215Z", "", "2 hours",  "http://myapp.com/processes/backup", "POST", {}) 

The returned job has a type of runlater.Job  

We can edit the job by changing it's members

job.url = "http://myapp.com/processes/newbackup" 

job = Server.updateJob(job)

Here is a quick rundown of each method

# Get a list of all Jobs for this API Key
ServerConnection.viewJobs() 

# Find a specific Job based by it's unique identifier
ServerConnection.viewJob(jobid) 

# Create a Job
ServerConnection.createJob(name, when, body, interval, url, method, headers )

# Delete a Job  (Job must be a runlater.Job object)
ServerConnection.deleteJob(job)

# Get all Logs
ServerConnection.getLogs()
