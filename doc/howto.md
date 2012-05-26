
How RunLater Works

Each organization that uses RunLater will have 1 user account and multiple API accounts. 

The user account consists of a username and password. Using it you can generate API accounts consisting of a key pair and a name.  

Joe's Widgets might consist of:

User Account:
{ 
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
	owner: "joe@joeswidgets.com"
	name: "Marks Widget Sales" 
	key: "145ab45de" 
	secret: "62456bc123edf"
} 

{ 
	owner: "joe@joeswidgets.com"
	name: "Backup Processes" 
	key: "2ab1445de" 
	secret: "b123c123edf"
} 

Each Job is submitted using the "key" and "secret" from an API Account. The key is specified in the header and the secret is used to determined the HMAC of the body.


