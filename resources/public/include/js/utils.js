

PASS_PHRASE = "SIMPLEOBSCURE";

$.ajaxSetup ({
    // Disable caching of AJAX responses
    cache: false
});


var lookup = {};
var showing = 0;
selectedJobs = [];

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

function renderTable()
{
	if(showing)
	{
		renderLogs();
	}
	else
	{
		renderJobs();
	}
}

function renderSwitch(val)
{
	showing = val;
	setCookie('runlater_cred','{"account" : "'+account+'", "password" : "'+pass+'", "keyPos" : "'+$("select[name*=keys]").val()+'", "showing" : '+showing+'}',1);
	renderTable();
}	

function checkSelect(val)
{
	$('button[id*=jobDeleteButton]').hide();
	if($("input[id*="+val+"]").attr('checked') == 'checked')
	{
		selectedJobs.push(val);
	}
	else
	{
		selectedJobs.splice(selectedJobs.indexOf(val), 1);
	}
	if(selectedJobs.length)
	{
		$('button[id*=jobDeleteButton]').show();
	}
}

allchecked = false
function checkall()
{
	if(!allchecked)
	{
		allchecked = true;
	}
	else
	{
		allchecked = false;
	}
	$('table[id*=jobsTable]').find('input:checkbox').attr('checked', allchecked);
	$('table[id*=jobsTable]').find('input:checkbox').each(function (i) {
	if(this.id != 'checkboxMain')
	{
		checkSelect(this.id);
	}
	});
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
					url: "users/" + account + "/apikeys/" + $("div[name*=addKeyDialog]").find("[name*=keyname]").val(),
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

function defaultKey()
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
					url: "users/" + account + "/apikeys/" + 'default',
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

function deleteSelectedKey()
{
        if(keyToRemove = $("select[name*=keys]").find("option").length == 1)
	{
		return;
	}
        keyToRemove = $("select[name*=keys]").val();

	if(!confirm("Delete Key "+keyToRemove+"?"))
	{
		return;
	}

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
			url: "users/" + account + "/apikeys/" + keyToRemove,
			type: "DELETE",
			contentType: 'application/json',
			error: function(XMLHttpRequest, textStatus, errorThrown){
			    console.log(errorThrown);
			}, success: function(data, textStatus, XMLHttpRequest){
				updateStatus("Key " + name + " deleted.");
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
						lookup = {};
						$('select[name*=keys]').children().remove();
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
						if(getCookie("runlater_cred"))
						{
							cred = JSON.parse(getCookie("runlater_cred"));
							$("select[name*=keys]").val(cred["keyPos"]);
						}
						renderTable();
					},
				    });
}

function keySwitch(ele)
{
	var pass = CryptoJS.AES.encrypt(password, PASS_PHRASE);
	setCookie('runlater_cred','{"account" : "'+account+'", "password" : "'+pass+'", "keyPos" : "'+$("select[name*=keys]").val()+'", "showing" : '+showing+'}',1);

	privateKey = lookup[ele.value];
	publicKey = ele.value;
	renderTable();
}

function deleteJob(val)
{
	URL = "/users/" + account + "/jobs/" + val;

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
		type: "DELETE",
		error: function(XMLHttpRequest, textStatus, errorThrown){
		    console.log(errorThrown);
		}, success: function(data, textStatus, XMLHttpRequest){
		}
	});
}

function deleteSelected()
{
	if(confirm("Delete Selected?"))
	{
		jQuery.each(selectedJobs, function(i) {
			deleteJob(this);
		}); 
		renderTable();
	}
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
				buildJobTable(JSON.parse(response));
		}
	});
}


function renderLogs()
{
        logLoading();

	publicKey = $("select[name*=keys]").val();
	privateKey = lookup[privateKey = $("select[name*=keys]").val()];
	
	URL = "/users/" + account + "/logs/" + publicKey;

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
				buildLogTable(JSON.parse(response));
		}
	});
}

function showToolbarbuttons()
{
	$('div[name*=toolbar]').find('button').removeAttr('disabled');
}

function hideToolbarbuttons()
{
	$('div[name*=toolbar]').find('button').attr('disabled', 'disabled');
}

function SortByName(a, b){
  var aName = a.name.toLowerCase();
  var bName = b.name.toLowerCase(); 
  return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}

function SortByBegan(a, b){
  var aName = a.began.toLowerCase();
  var bName = b.began.toLowerCase(); 
  return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}

function logLoading()
{
	$('table[class=tablesorter]').html("");
	$('button[id*=addJobButton]').attr('disabled', true);
	$('button[id*=jobDeleteButton]').hide();
	$("div[name*=toolbar]").show();
	$("div[name*=welcome]").show();
	$(".loading").show();

}

function buildLogTable(objResults)
{
	selectedJobs = [];
	textLogs     = {};

	var table='<table CELLPADDING=0 CELLSPACING=0 BORDER=0 style="background-color: #FFFFFF;" class="tablesorter" id="logsTable" name="logsTable">';

	table+='<thead style="padding:0;"><tr">';
	table+='<th style="padding-left: 2px;">BEGAN</th>';       
	table+='<th>ENDED</th>';       
	table+='<th>JOBID</th>';       
	table+='<th>RESULT</th>';       
	table+='<th>SCHEDULED</th>';       
	table+='<th>USER</th></tr></thead><tbody>';       
	beenHere = false;
	for(var i = 0; i < objResults.length; i++)
	{
                beenHere = true;
		linkText = '';
		if($.trim(objResults[i].result))
		{
			textLogs[objResults[i]._id] = objResults[i].result.body;
			linkText = '<a href=javascript:showText("'+objResults[i]._id+'")>Result</a>';
		}
		table+='<tr>';
		table+='<td style="padding-left: 2px;text-align:left;" valign="LEFT">'+objResults[i].began+'</td>';    
		table+='<td style="text-align:left;" valign="LEFT">'+objResults[i].ended+'</td>';    
		table+='<td style="text-align:left;" valign="LEFT">'+objResults[i].jobid+'</td>';    
		table+='<td style="text-align:left;" valign="LEFT">'+linkText+'</td>'; 
		table+='<td style="text-align:left;" valign="LEFT">'+objResults[i].scheduled+'</td>';    
		table+='<td style="text-align:left;" valign="LEFT">'+objResults[i].userid+'</td>';    
		table+='</tr>';
	}
	table+='</tbody></table>';
	if(!beenHere)
	{
		table+="No Logs"
	}

	$(".loading").hide();
	$(".tableWrapper").html( table );	

	$("#logsTable").tablesorter(); 

}

function buildJobTable(objResults)
{
	$('button[id*=addJobButton]').attr('disabled', false);

	selectedJobs = [];
	textJobs     = {};
	$('button[id*=jobDeleteButton]').hide();

        objResults.sort(SortByName);

	$("div[name*=toolbar]").show();
	$("div[name*=welcome]").show();
	$(".loading").show();

	var table='<table CELLPADDING=0 CELLSPACING=0 BORDER=0 style="background-color: #FFFFFF;" class="tablesorter" id="jobsTable" name="jobsTable">';

	table+='<thead style="padding:0;"><tr">';
	table+='<th style="width:10px;"><input type="checkbox" id="checkboxMain" onclick="javascript:checkall();"/></th>';
	table+='<th>NAME</th>';       
	table+='<th>URL</th>';       
	table+='<th>DATA</th>';       
	table+='<th style="width:160px;">METHOD</th>';       
	table+='<th>INTERVAL</th>';       
	table+='<th>WHEN</th></tr></thead><tbody>';       
	beenHere = false;
	for(var i = 0; i < objResults.length; i++)
	{
		linkText = '';
		if($.trim(objResults[i].body))
		{
			textJobs[objResults[i]._id] = objResults[i].body;
			linkText = '<a href=javascript:showText("'+objResults[i]._id+'")>Body</a>';
		}
		beenHere = true;
		table+='<tr>';
		table+='<td><input onclick="checkSelect('+"'"+objResults[i]._id+"'"+');" type="checkbox" id="'+objResults[i]._id+'"/></td>';       
		table+='<td style="text-align:left;" valign="LEFT">'+objResults[i].name+'</td>';    
		table+='<td style="text-align:left;" valign="LEFT">'+objResults[i].url+'</td>';    
		table+='<td style="text-align:left;" valign="LEFT">'+linkText+'</td>';    
		table+='<td style="text-align:left;" valign="LEFT">'+objResults[i].method+'</td>';    
		table+='<td style="text-align:left;" valign="LEFT">Every '+getAttributeByIndex(objResults[i].interval, 0)+' '+getAttributeByName(objResults[i].interval, 0)+'</td>';    
		table+='<td style="text-align:left;" valign="LEFT">'+objResults[i].when+'</td>';    
		table+='</tr>';
	}
	table+='</tbody></table>';
	if(!beenHere)
	{
		table+="No Jobs"
	}

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
	$("div[name*=content]").attr("disabled", false);
	$("div[name*=addKeyDialog]").dialog('close');
}

function updateStatus(str)
{
	$("#status").html(str);
}

function addJob()
{
	var TZD = "0";

	var name     = $("div[name*=addJobDialog]").find("[name*=name]").val();
	var url      = $("div[name*=addJobDialog]").find("[name*=url]").val();
	var interval = $("div[name*=addJobDialog]").find("[name*=interval]").val();
	var when     = $("div[name*=addJobDialog]").find("[name*=when]").val();
	var method   = $("div[name*=addJobDialog]").find("[name*=method]").val();
	var body     = $('div[name*=addJobDialog]').find('textarea[name*=jobTextArea]').val();
	data = ' { ';
	data += '"name" : "' + name + '" , ';
	data += '"when" : "' + $('div[name*=addJobDialog]').find('input[name*=date]').val() + 'T' + $('div[name*=addJobDialog]').find('input[name*=time]').val() + ".000" + TZD + 'Z", ';
	data += '"interval" : "'+interval+' '+when+'",';
	data += '"url" : "' + url + '" , ';
	data += '"method" : "'+method+'" , ';
	data += '"body" : "'+body+'"'; 
	data += '"headers" : {}'; 
	data += ' } ';

	trimmedName = $.trim(name)
	if(trimmedName.length == 0 || $("div[name*=addJobDialog]").find("[name*=name]").css('background-color') == 'rgb(255, 151, 151)')
	{
		$("div[name*=addJobDialog]").find("[name*=name]").css('background-color', 'rgb(255, 151, 151)');
		$("div[name*=addJobDialog]").find("[name*=name]").val('Please Enter a name');
		return;
	}

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
					renderTable();
			}
		    });

}

function showUserDialog()
{
	$("div[name*=editUserDialog]").css('display', 'block');
	$("div[name*=editUserDialog]").dialog({"width" : "400px", "title" : "Edit User", "modal" : true, "resizable" : false});
}

function buildMilitaryTime()
{
	timeString = ""
	theDate = new Date()
	if(theDate.getHours() < 10)
	{
		timeString += "0";
	}
	timeString += theDate.getHours() + ":";
	if(theDate.getMinutes() < 10)
	{
		timeString += "0";
	}
	timeString += theDate.getMinutes() + ":";
	if(theDate.getSeconds() < 10)
	{
		timeString += "0";
	}
	timeString += theDate.getSeconds();

	return timeString
}

function showJobDialog()
{
	$("div[name*=addJobDialog]").css('display', 'block');
	$("div[name*=addJobDialog]").dialog({"width" : "400px", "title" : "Add Job", "modal" : true, "resizable" : false});
	$('div[name*=addJobDialog]').find('input[name*=time]').val('');
	$('div[name*=addJobDialog]').find('input[name*=date]').val('');
	$('div[name*=addJobDialog]').find('input[name*=interval]').val('30');
	$('div[name*=addJobDialog]').find('input[name*=interval]').val('30');
	$('div[name*=addJobDialog]').find('textarea[name*=jobTextArea]').val('');
	$('div[name*=addJobDialog]').find('input[name*=time]').timepicker({ 'timeFormat': 'H:i:s', 'scrollDefaultNow': true });
	$('div[name*=addJobDialog]').find('input[name*=time]').val(buildMilitaryTime);
	$('div[name*=addJobDialog]').find('input[name*=date]').datepicker({dateFormat : $.datepicker.ATOM});
	$('div[name*=addJobDialog]').find('input[name*=date]').datepicker('setDate', new Date());

	$('div[name*=addJobDialog]').find('select[name*=method]').html("");
	$('div[name*=addJobDialog]').find('select[name*=method]').append(new Option("POST", "POST", true, true));
	$('div[name*=addJobDialog]').find('select[name*=method]').append(new Option("GET", "GET", false, false));
	$('div[name*=addJobDialog]').find('select[name*=method]').append(new Option("PUT", "PUT", false, false));
	$('div[name*=addJobDialog]').find('select[name*=method]').append(new Option("DELETE", "DELETE", false, false));
}

function showKeysDialog()
{
	$("div[name*=content]").attr("disabled", true);
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
		showing   = creds["showing"];
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
	setCookie('runlater_cred','{"account" : "'+account+'", "password" : "'+pass+'", "showing" : '+showing+'}',1);
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
						defaultKey();
						alert("User created!");
						window.location = "interface.html";
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

	if(!back)
	{
		return;
	}
	addUser(account, password, email);

}

function nameCleaner(e)
{
  e=e || window.event;
  var who=e.target || e.srcElement;
  who.value= who.value.replace(/[^\w-]+/g,'');
}

function showText(val)
{
	$("div[name*=info]").dialog({position: 'top', dialogClass : "alert", modal : true, width: "500px", buttons:{ "Ok": function(){ $(this).dialog("close")}}});
	$("div[name*=info]").siblings('.ui-dialog-titlebar').remove();
	if(showing)
	{
		$("div[name*=info]").find("textarea").val(textLogs[val]);
	}
	else
	{
		$("div[name*=info]").find("textarea").val(textJobs[val]);
	}
}

function widgetizeButtons()
{
			    $(function() {
				$( "input[type=submit], button" )
				    .button()
			    });
		            $("div[name*=addJobDialog]").find("input[name*=name]").focus(function() {
			       if($("div[name*=addJobDialog]").find("input[name*=name]").css('background-color') == 'rgb(255, 151, 151)')
			       {
					$("div[name*=addJobDialog]").find("input[name*=name]").css('background-color', 'white');
					$("div[name*=addJobDialog]").find("input[name*=name]").val('');
			       }     
			    });
		            $("div[name*=addJobDialog]").find("input[name*=name]").keyup(function(e) {
				        nameCleaner(e);
			    });
			    $("div[name*=addJobDialog]").find("input[name*=name]").change(function(e) {
				        nameCleaner(e);
			    });
			    $("div[name*=addKeyDialog]").find("input[name*=keyname]").keyup(function(e) {
				        nameCleaner(e);
			    });		
			     $("div[name*=addJobDialog]").find("button[id*=addJobButton]").click(function(e, enterKeyPressed) {
					if(e.originalEvent.detail)
					{
						addJob();
					}
			    });	
			    $("div[name*=addKeyDialog]").find("button[id*=addKeyButton]").click(function(e, enterKeyPressed) {
					if(e.originalEvent.detail)
					{
						addKey();
					}
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

