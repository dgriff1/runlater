
var account   = "runlater_test";
var password  = "pass";
var publicKey = "new";
var privateKey = "[LkeuKysMk[r";

var lookup = {};

function addKey(key)
{
			var hash = CryptoJS.HmacSHA1(account, "");
			hash = hash.toString(CryptoJS.enc.Base64);	

			$.ajax({
					headers: {
						"Content-Type"  : "application/json"
					},
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Content-Type", "application/json");
						xhr.setRequestHeader("Accept", "application/json");
						xhr.setRequestHeader("runlater_password", password);
					     },
					url: "users/" + account + "/apikeys/" + key,
					type: "PUT",
					contentType: 'application/json',
					error: function(XMLHttpRequest, textStatus, errorThrown){
					    console.log(errorThrown);
					}, success: function(data, textStatus, XMLHttpRequest){
						console.log(XMLHttpRequest.responseText);
					},
				    });
}

function getKeys()
{
			var hash = CryptoJS.HmacSHA1(account, "");
			hash = hash.toString(CryptoJS.enc.Base64);	

			$.ajax({
					headers: {
						"Content-Type"  : "application/json"
					},
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Content-Type", "application/json");
						xhr.setRequestHeader("Accept", "application/json");
						xhr.setRequestHeader("runlater_password", password);
					     },
					url: "users/" + account + "/apikeys/",
					type: "GET",
					contentType: 'application/json',
					error: function(XMLHttpRequest, textStatus, errorThrown){
					    console.log(errorThrown);
					}, success: function(data, textStatus, XMLHttpRequest){
						response = XMLHttpRequest.responseText;
						console.log(response);
						lookup = {};
						for (var k in JSON.parse(response))
						{
							lookup[k] = JSON.parse(response)[k];
							$('#keys').append(new Option(k, k, true, true));
						}
					},
				    });
}

function keySwitch(ele)
{
	privateKey = lookup[ele.value];
	publicKey = ele.value;
	renderJobs();
}

function renderJobs()
{
	URL = "/users/" + account + "/apikey/" + publicKey + "/jobs/";

	var hash = CryptoJS.HmacSHA1(URL, privateKey);
	hash = hash.toString(CryptoJS.enc.Base64);	

	$.ajax({
		headers: {
			"runlater_password" : password,
			"runlater_key"      : publicKey,
			"runlater_hash"     : hash,
		},
		beforeSend: function(xhr) {
			xhr.setRequestHeader("runlater_password", password);
			xhr.setRequestHeader("runlater_key", publicKey);
			xhr.setRequestHeader("runlater_hash", hash);
		},
		url: URL,
		type: "GET",
		error: function(XMLHttpRequest, textStatus, errorThrown){
		    console.log(errorThrown);
		}, success: function(data, textStatus, XMLHttpRequest){
				console.log('Jobs', XMLHttpRequest.responseText);
				buildTable(JSON.parse(XMLHttpRequest.responseText));
		}
	});
}

function buildTable(objResults)
{

	var table='<table class="tablesorter" id="jobsTable" name="jobsTable" width="100%" border="0">';

	table+='<thead><tr style="height: 20px;">';
	table+='<th><input type="checkbox" id="checkboxMain"/></th>';
	table+='<th>NAME</th>';       
	table+='<th>URL</th>';       
	table+='<th>METHOD</th>';       
	table+='<th>INTERVAL</th>';       
	table+='<th>WHEN</th></tr></thead><tbody>';       
	for(var i = 0; i < objResults.length; i++)
	{
		table+='<tr>';
		table+='<td><input type="checkbox" id="'+objResults[i]._id+'"/></td>';       
		table+='<td>'+objResults[i].name+'</td>';    
		table+='<td>'+objResults[i].url+'</td>';    
		table+='<td>'+objResults[i].method+'</td>';    
		table+='<td>'+objResults[i].internal+'</td>';    
		table+='<td>'+objResults[i].when+'</td>';    
		table+='</tr>';
	}
	table+='</tbody></table>';


	$(".tableWrapper").html( table );	

	$("#jobsTable").tablesorter(); 
}

function closeJob()
{
	$(".addJobDialog").find("[name=name]").val("");
	$(".addJobDialog").find("[name=url]").val("");
	$(".addJobDialog").dialog('close');
}

function updateStatus(str)
{
	$("#status").html(str);
}

function addJob()
{
	var name = $(".addJobDialog").find("[name=name]").val();
	var url = $(".addJobDialog").find("[name=url]").val();
	data = ' { ';
	data += '"name" : "' + name + '" , ';
	data += '"when" : "2012-05-06T06:15:42.215Z", ';
	data += '"interval" : "2 hours",';
	data += '"url" : "' + url + '" , ';
	data += '"method" : "PUT" , ';
	data += '"headers" : {}'; 
	data += ' } ';

	var hash = CryptoJS.HmacSHA1(data, privateKey);
	hash = hash.toString(CryptoJS.enc.Base64);	

	$.ajax({
			headers: {
				"runlater_key"       : publicKey,
				"runlater_password"  : password,
				"runlater_hash"      : hash,
				"Content-Type"       : "application/json"
			},
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Content-Type", "application/json");
				xhr.setRequestHeader("Accept", "application/json");
				xhr.setRequestHeader("runlater_password", password);
				xhr.setRequestHeader("runlater_key", publicKey);
				xhr.setRequestHeader("runlater_hash", hash);
			     },
			url: "users/" + account + "/jobs/",
			type: "PUT",
			data: data,
			dataType: "json",
			contentType: 'application/json',
			error: function(XMLHttpRequest, textStatus, errorThrown){
			    console.log(errorThrown);
			}, success: function(data, textStatus, XMLHttpRequest){
					updateStatus("Job " + name + " added.");
					closeJob();
					renderJobs();
			}
		    });

}

function showJobDialog()
{
	$(".addJobDialog").dialog({"width" : "400px", "title" : "Add Job"});
}

function getUser(username, password)
{

}

function addUser(username, password, email)
{
			$.ajax({
					headers: {
						"Content-Type"       : "application/json",
						"Accept"       : "application/json"
					},
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Content-Type", "application/json");
						xhr.setRequestHeader("Accept", "application/json");
				        },
					url: "users/",
					type: "PUT",
					contentType: 'application/json',
					data: JSON.stringify(  { "account" : username, "first" : "mitt", "last" : "miles", "email" : email, "password" : password, "company" : "President" }  ),
					error: function(XMLHttpRequest, textStatus, errorThrown){
					    console.log(errorThrown);
					}, success: function(data, textStatus, XMLHttpRequest){
							userObj  = JSON.parse(XMLHttpRequest.responseText);
							account = username;
							password = password;
							getKeys();
						}
				    });
}

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

