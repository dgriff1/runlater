
var account   = "runlater_test";
var password  = "pass";
var publicKey = "new";
var privateKey = "[LkeuKysMk[r";

function getKeys()
{
			var hash = CryptoJS.HmacSHA1(account, "");
			hash.toString(CryptoJS.enc.Base64);	

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
						console.log(XMLHttpRequest.responseText);
						objResults = JSON.parse(XMLHttpRequest.responseText);	
					},
				    });
}

function renderJobs()
{
			var hash = CryptoJS.HmacSHA1("/users/" + account + "/apikey/" + publicKey + "/jobs/", privateKey);
			hash = hash.toString(CryptoJS.enc.Base64);	

			$.ajax({
					headers: {
						"runlater_key"  : publicKey,
						"runlater_hash" : hash,
						"Content-Type"  : "application/json"
					},
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Content-Type", "application/json");
						xhr.setRequestHeader("Accept", "application/json");
						xhr.setRequestHeader("runlater_password", password);
						xhr.setRequestHeader("runlater_key", publicKey);
						xhr.setRequestHeader("runlater_hash", hash);
					     },
					url: "users/" + account + "/apikey/" + publicKey + "/jobs/",
					type: "GET",
					contentType: 'application/json',
					error: function(XMLHttpRequest, textStatus, errorThrown){
					    console.log(errorThrown);
					}, success: function(data, textStatus, XMLHttpRequest){
							console.log('Jobs', JSON.parse(XMLHttpRequest.responseText));
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
	data += '"method" : "POST" , ';
	data += '"headers" : {}'; 
	data += ' } ';

	var hash = CryptoJS.HmacSHA1(data, privateKey);
	hash = hash.toString(CryptoJS.enc.Base64);	

	$.ajax({
			headers: {
				"runlater_key"  : publicKey,
				"runlater_hash" : hash,
				"Content-Type"  : "application/json"
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
			    alert(errorThrown);
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

function testTest()
{
	alert("DD");
}

function addUser()
{
			var id = false;
			$.ajax({
					url: "users/",
					type: "PUT",
					contentType: 'application/json',
					data: JSON.stringify(  { "first" : "Dan", "last" : "Griffin", "email" : "test@runlater.com", "password" : "pass", "company" : "runlater" }  ),
					error: function(XMLHttpRequest, textStatus, errorThrown){
					    alert(errorThrown);
					}, success: function(data, textStatus, XMLHttpRequest){
						    var resp = JSON.parse(XMLHttpRequest.responseText);
						    var id = (resp["_id"]);
							$.ajax({
								url: "users/" + id,
								type: "GET",
								contentType: "application/json",
								error: function(XMLHttpRequest, textStatus, errorThrown){
								    alert(errorThrown);
								}, success: function(data, textStatus, XMLHttpRequest){
									userRecord = JSON.parse(XMLHttpRequest.responseText);
									alert(userRecord.first);
								}

							});

					}
				    });
}
