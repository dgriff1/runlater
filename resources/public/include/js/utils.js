
var userID = "501b0ffee4b056f52558715e";
var publicKey = "prodkey";
var privateKey = "QrF4fHSHWQrM";

function renderJobs()
{
			var hash = CryptoJS.HmacSHA1(privateKey, "");

			hash.toString(CryptoJS.enc.Base64);	
			$.ajax({
					headers: {
						"runlater_key" : publicKey,
						"runlater_hash" : hash,
						"Content-Type" : "application/json"
					},
					url: "users/" + userID + "/jobs/",
					type: "GET",
					contentType: 'application/json',
					error: function(XMLHttpRequest, textStatus, errorThrown){
					    alert(errorThrown);
					}, success: function(data, textStatus, XMLHttpRequest){
						  	buildTable(JSON.parse(XMLHttpRequest.responseText));
					}
				    });
}

function buildTable(results)
{
	var table='<table id="jobsTable" name="jobsTable" width="100%" border="0">';

	table+='<tr>';
	table+='<th></th>';
	table+='<th>NAME</th>';       
	table+='<th>STATUS</th>';       
	table+='<th>URL</th>';       
	table+='<th>INTERVAL</th>';       
	table+='<th>WHEN</th></tr>';       
	for(var i = 0; i < results.length; i++)
	{
		table+='<tr>';
		table+='<td><input type="checkbox" id="'+results[i]._id+'"></td>';       
		table+='<td>'+results[i].name+'</td>';    
		table+='<td>'+results[i].status+'</td>';    
		table+='<td>'+results[i].url+'</td>';    
		table+='<td>'+results[i].internal+'</td>';    
		table+='<td>'+results[i].when+'</td>';    
		table+='</tr>';
	}
	table+='</table>';


	$(".tableWrapper").html( table );	
	$(".jobsTable").tablesorter(); 
}

function closeJob()
{
	$(".addJobDialog").find("[name=name]").val("");
	$(".addJobDialog").find("[name=url]").val("");
	$(".addJobDialog").dialog('close');
}

function updateStatus(str)
{
 	$('#status').fadeIn('slow');
	$("#status").html(str);
 	$('#status').fadeOut(2000);
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

	var hash2 = CryptoJS.HmacSHA1(data, privateKey);
	hash2 = hash2.toString(CryptoJS.enc.Base64);	

	$.ajax({
			beforeSend: function(xhr) {
				xhr.setRequestHeader("runlater_key", publicKey);
				xhr.setRequestHeader("runlater_hash", encodeURI(hash2));
				xhr.setRequestHeader("Content-Type", "application/json");
				xhr.setRequestHeader("Accept", "application/json");
			     },
			url: "users/" + userID + "/jobs/",
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
