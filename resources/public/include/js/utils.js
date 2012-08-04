
var userID = "501b0ffee4b056f52558715e";
var publicKey = "prodkey";
var privateKey = "QrF4fHSHWQrM";

var globalResults = [];

function objLength(obj)
{
	var count = 0;
	for (var p in obj) {
	    if (obj.hasOwnProperty(p)) {
		count++;
	    }
	}
	return count;
}

function objCopy(obj1, obj2)
{
	temp = {};
	temp["name"] = obj1["name"];
	temp["num"] = obj1["num"];
	obj1["name"] = obj2["name"];
	obj1["num"] = obj2["num"];
	obj2["name"] = temp["name"];
	obj2["num"] = temp["num"];
}

function objSort(obj, column)
{
	for(i = 0;i < objLength(obj);i = i + 1)
	{
		for(j = 0;j < objLength(obj);j = j + 1)
		{
			if(obj[i][column] > obj[j][column])
			{
				objCopy(obj[i], obj[j]);
			}
		}
	}

}

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
						  	buildTable(JSON.parse(XMLHttpRequest.responseText), "name");
					}
				    });
}

function tableWrapper(obj)
{
	buildTable(globalResults, $(obj).html().toLowerCase());
}

function buildTable(objResults, column)
{
	globalResults = objResults;

	if(column)
	{
		objResults.sort(function (a, b) {

		    // a and b will be two instances of your object from your list

		    // possible return values
		    var a1st = -1; // negative value means left item should appear first
		    var b1st =  1; // positive value means right item should appear first
		    var equal = 0; // zero means objects are equal

		    // compare your object's property values and determine their order
		    if (b[column] < a[column]) {
			return b1st;
		    }
		    else if (a[column] < b[column]) {
			return a1st;
		    }
		    else {
			return equal;
		    }
		});
	}


	var table='<table id="jobsTable" name="jobsTable" width="100%" border="0">';

	table+='<tr>';
	table+='<th onclick="javascript:tableWrapper(this);"><input type="checkbox" id="checkboxMain"/></th>';
	table+='<th onclick="javascript:tableWrapper(this);">NAME</th>';       
	table+='<th onclick="javascript:tableWrapper(this);">URL</th>';       
	table+='<th onclick="javascript:tableWrapper(this);">INTERVAL</th>';       
	table+='<th onclick="javascript:tableWrapper(this);">WHEN</th></tr>';       
	for(var i = 0; i < objResults.length; i++)
	{
		table+='<tr>';
		table+='<td><input type="checkbox" id="'+objResults[i]._id+'"/></td>';       
		table+='<td>'+objResults[i].name+'</td>';    
		table+='<td>'+objResults[i].url+'</td>';    
		table+='<td>'+objResults[i].internal+'</td>';    
		table+='<td>'+objResults[i].when+'</td>';    
		table+='</tr>';
	}
	table+='</table>';


	$(".tableWrapper").html( table );	
}

function closeJob()
{
	$(".addJobDialog").find("[name=name]").val("");
	$(".addJobDialog").find("[name=url]").val("");
	$(".addJobDialog").dialog('close');
}

function updateStatus(str)
{
 	$('#status').show();
	$("#status").html(str);
 	$('#status').fadeOut(4000);
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
