
$.ajaxSetup ({
    // Disable caching of AJAX responses
    cache: false
});


var lookup = {};

function addKey()
{
			var hash = CryptoJS.HmacSHA1(account, "");
			hash = hash.toString(CryptoJS.enc.Base64);	

			$.ajax({
					headers: {
						"Content-Type"  : "application/json",
						"Accept-Type"  : "application/json"
					},
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Content-Type", "application/json");
						xhr.setRequestHeader("Accept", "application/json");
						xhr.setRequestHeader("runlater_password", password);
					     },
					url: "users/" + account + "/apikeys/" + $("div[name*=addKeyDialog]").find("[name=keyname]").val(),
					type: "PUT",
					contentType: 'application/json',
					error: function(XMLHttpRequest, textStatus, errorThrown){
					    console.log(errorThrown);
					}, success: function(data, textStatus, XMLHttpRequest){
						updateStatus("Key " + name + " added.");
						closeKey();
						getKeys();
					},
				    });
}

function getKeys()
{

			$.ajax({
					headers: {
						"Content-Type"  : "application/json",
						"Accept-Type"  : "application/json"
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
					    showLoginDialog();
					    console.log(errorThrown);
					}, success: function(data, textStatus, XMLHttpRequest){
						response = XMLHttpRequest.responseText;
						console.log(response);
						lookup = {};
						$('select[name*=]').html("");
						for (var k in JSON.parse(response))
						{
							lookup[k] = JSON.parse(response)[k];
							$('select[name*=keys]').append(new Option(k, k, true, true));
						}
						renderJobs();
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
	publicKey = $("select[name*=keys]").val();
	privateKey = lookup[privateKey = $("select[name*=keys]").val()];
	
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
				response = XMLHttpRequest.responseText;
				console.log('Jobs', response);
				buildTable(JSON.parse(response));
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
	beenHere = false;
	for(var i = 0; i < objResults.length; i++)
	{
		beenHere = true;
		table+='<tr>';
		table+='<td><input type="checkbox" id="'+objResults[i]._id+'"/></td>';       
		table+='<td>'+objResults[i].name+'</td>';    
		table+='<td>'+objResults[i].url+'</td>';    
		table+='<td>'+objResults[i].method+'</td>';    
		table+='<td>'+objResults[i].internal+'</td>';    
		table+='<td>'+objResults[i].when+'</td>';    
		table+='</tr>';
	}
	if(!beenHere)
	{
		table+='<tr><td>No Jobs</td></tr>'
	}
	table+='</tbody></table>';


	$(".tableWrapper").html( table );	

	$("#jobsTable").tablesorter(); 
}

function closeJob()
{
	$("div[name*=addJobDialog]").find("[name=name]").val("");
	$("div[name*=addJobDialog]").find("[name=url]").val("");
	$("div[name*=addJobDialog]").dialog('close');
}

function closeKey()
{
	$("div[name*=addKeyDialog]").find("[name=keyname]").val("");
	$("div[name*=addKeyDialog]").dialog('close');
}

function updateStatus(str)
{
	$("#status").html(str);
}

function addJob()
{
	var name = $("div[name*=addJobDialog]").find("[name=name]").val();
	var url = $("div[name*=addJobDialog]").find("[name=url]").val();
	data = ' { ';
	data += '"name" : "' + name + '" , ';
	data += '"when" : "2012-05-06T06:15:42.215Z", ';
	data += '"interval" : "2 hours",';
	data += '"url" : "' + url + '" , ';
	data += '"method" : "PUT" , ';
	data += '"headers" : {}'; 
	data += ' } ';

	publicKey = $("select[name*=keys]").val();
	privateKey = lookup[privateKey = $("select[name*=keys]").val()];

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
	$("div[name*=addJobDialog]").dialog({"width" : "400px", "title" : "Add Job", "modal" : true, "resizable" : false});
}

function showKeysDialog()
{
	$("div[name*=addKeyDialog]").css('display', 'block');
	$("div[name*=addKeyDialog]").dialog({
					"width"     : "420px",
				       	"title"     : "Add Keys", 
					"modal"     : true, 
					"resizable" : false,
				  });
}

function showLoginDialog()
{
	$(".content").hide();
	$("div[name*=loginDialog]").dialog({"width" : "400px", "title" : "Login", "modal" : true, "resizable" : false});
}

function Login()
{
	account  = $("div[name*=loginDialog]").find("[name=account]").val();
	password = $("div[name*=loginDialog]").find("[name=password]").val();
	$("div[name*=loginDialog]").dialog('close');
	$(".content").show();
	getKeys();
}

function addUser(username, password, email)
{
			$.ajax({
					headers: {
						"Content-Type" : "application/json",
						"Accept"       : "application/json"
					},
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Content-Type", "application/json");
						xhr.setRequestHeader("Accept", "application/json");
				        },
					url: "users/",
					type: "PUT",
					async: false,
					contentType: 'application/json',
					data: JSON.stringify(  { "account" : username, "first" : "mitt", "last" : "miles", "email" : email, "password" : password, "company" : "President" }  ),
					error: function(XMLHttpRequest, textStatus, errorThrown){
					    console.log(errorThrown);
					}, success: function(data, textStatus, XMLHttpRequest){
						alert("User created!");
					}
				    });
}

function signUp(ele)
{
	account  = $("input[name*=account]").val();
	password = $("input[name*=password]").val();
	email    = $("input[name*=email]").val();

	back = true;
	if(account.length < 1)
	{
		$("input[name*=account]").css('background-color', 'red');
		back = false;
	}
	if(password.length < 1)
	{
		$("input[name*=password]").css('background-color', 'red');
		back = false;
	}
	if(email.length < 1)
	{
		$("input[name*=email]").css('background-color', 'red');
		back = false;
	}

	addUser(account, password, email);

	if(back)
	{
		window.location = 'interface.html';
	}

	return back;
}


