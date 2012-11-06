
PASS_PHRASE = "SIMPLEOBSCURE";

$.ajaxSetup ({
    // Disable caching of AJAX responses
    cache: false
});


var lookup = {};

function getAttributeByIndex(obj, index){
  var i = 0;
  for (var attr in obj){
    if (index === i){
      return obj[attr];
    }
    i++;
  }
  return null;
}

function getAttributeByName(obj, index){
  var i = 0;
  for (var attr in obj){
    if (index === i){
      return attr;
    }
    i++;
  }
  return null;
}


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
						$("select[name*=keys]").html($("option", $("select[name*=keys]")).sort(function(a, b) { 
						    var arel = $(a).attr('value');
						    var brel = $(b).attr('value');
						    return arel == brel ? 0 : arel < brel ? -1 : 1 
						}));
						renderJobs();
					},
				    });
}

function keySwitch(ele)
{
	var pass = CryptoJS.AES.encrypt(password, PASS_PHRASE);
	setCookie('runlater_cred','{"account" : "'+account+'", "password" : "'+pass+'", "keyPos" : "'+$("select[name*=keys]").val()+'"}',1);
	console.log(getCookie("runlater_cred"));

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
	$(".loading").show();

	var table='<table style="background-color: #FFFFFF;" class="tablesorter" id="jobsTable" name="jobsTable" border="0">';

	table+='<thead><tr>';
	table+='<th style="width:10px;"><input type="checkbox" id="checkboxMain"/></th>';
	table+='<th>NAME</th>';       
	table+='<th>URL</th>';       
	table+='<th style="width:160px;">METHOD</th>';       
	table+='<th>INTERVAL</th>';       
	table+='<th>WHEN</th></tr></thead><tbody>';       
	beenHere = false;
	for(var i = 0; i < objResults.length; i++)
	{
		beenHere = true;
		table+='<tr>';
		table+='<td><input type="checkbox" id="'+objResults[i]._id+'"/></td>';       
		table+='<td style="text-align:left;" valign="LEFT">'+objResults[i].name+'</td>';    
		table+='<td style="text-align:left;" valign="LEFT">'+objResults[i].url+'</td>';    
		table+='<td style="text-align:left;" valign="LEFT">'+objResults[i].method+'</td>';    
		table+='<td style="text-align:left;" valign="LEFT">Every '+getAttributeByIndex(objResults[i].interval, 0)+' '+getAttributeByName(objResults[i].interval, 0)+'</td>';    
		table+='<td style="text-align:left;" valign="LEFT">'+objResults[i].when+'</td>';    
		table+='</tr>';
	}
	if(!beenHere)
	{
		table+='<tr><td>No Jobs</td></tr>'
	}
	table+='</tbody></table>';

	$(".loading").hide();
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
	var TZD = "0";

	var name = $("div[name*=addJobDialog]").find("[name=name]").val();
	var url = $("div[name*=addJobDialog]").find("[name=url]").val();
	data = ' { ';
	data += '"name" : "' + name + '" , ';
	data += '"when" : "' + $('div[name*=addJobDialog]').find('input[name*=date]').val() + ' T' + $('div[name*=addJobDialog]').find('input[name*=time]').val() + ".000" + TZD + 'Z", ';
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
	$("div[name*=loginDialog").child("button").attr('selected', 'selected');

	$("div[name*=addJobDialog]").css('display', 'block');
	$("div[name*=addJobDialog]").dialog({"width" : "400px", "title" : "Add Job", "modal" : false, "resizable" : false});
	$('div[name*=addJobDialog]').find('input[name*=time]').timepicker({ 'timeFormat': 'H:i:s', 'scrollDefaultNow': true });
	$('div[name*=addJobDialog]').find('input[name*=date]').datepicker({dateFormat : "yy-mmd-dd"});

	$('div[name*=addJobDialog]').find('select[name*=method]').html("");
	$('div[name*=addJobDialog]').find('select[name*=method]').append(new Option("POST", "POST", true, true));
	$('div[name*=addJobDialog]').find('select[name*=method]').append(new Option("GET", "GET", true, true));
	$('div[name*=addJobDialog]').find('select[name*=method]').append(new Option("PUT", "PUT", true, true));
	$('div[name*=addJobDialog]').find('select[name*=method]').append(new Option("DELETE", "DELETE", true, true));
}

function showKeysDialog()
{
	$("div[name*=addKeyDialog").child("button").attr('selected', 'selected');

	$("div[name*=addKeyDialog]").css('display', 'block');
	$("div[name*=addKeyDialog]").dialog({
					"width"     : "420px",
				       	"title"     : "Add Keys", 
					"modal"     : true, 
					"resizable" : false,
				  });
}

cookiepass = 1;
function showLoginDialog()
{
	if(getCookie("runlater_cred") && cookiepass)
	{
		cookiepass= 0;
		creds     = getCookie("runlater_cred");
		creds     = JSON.parse(creds);
		pass      = creds["password"];
	        password  = CryptoJS.AES.decrypt(pass, PASS_PHRASE).toString(CryptoJS.enc.Utf8);
		account   = creds["account"];
	        $(".content").show();
                getKeys();
	        return;	
	}
	$(".content").hide();
	$("div[name*=loginDialog]").dialog({"width" : "400px", "title" : "Login", "modal" : true, "resizable" : false});
	$("div[name*=loginDialog]").dialog("widget").find(".ui-dialog-titlebar-close").hide();   
}

function Login()
{
	account  = $("div[name*=loginDialog]").find("[name=account]").val();
	password = $("div[name*=loginDialog]").find("[name=password]").val();
	$("div[name*=loginDialog]").dialog('close');
	$(".content").show();
	getKeys();
	var pass = CryptoJS.AES.encrypt(password, PASS_PHRASE);
	setCookie('runlater_cred','{"account" : "'+account+'", "password" : "'+pass+'"}',1);
}

function Logout()
{
	del_cookie("runlater_cred");
	window.location = "interface.html";
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

function widgetizeButtons()
{
			    $(function() {
				$( "input[type=submit], button" )
				    .button()
				    .click(function( event ) {
					event.preventDefault();
				    });
			    });
}

function setCookie(c_name,value,exdays)
{
var exdate=new Date();
exdate.setDate(exdate.getDate() + exdays);
var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name)
{
var i,x,y,ARRcookies=document.cookie.split(";");
for (i=0;i<ARRcookies.length;i++)
{
  x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
  y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
  x=x.replace(/^\s+|\s+$/g,"");
  if (x==c_name)
    {
    return unescape(y);
    }
  }
}

function del_cookie(name)
{
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

