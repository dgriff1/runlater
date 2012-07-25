

function renderJobs()
{
		var hash = CryptoJS.SHA256("wtYpQKgYtYfJ");
		alert(hash);

			$.ajax({
					url: "jobs/" + "500f57d2e4b0fe671fc74d5e/",
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
	var table='<table width="100%" border="0">';
	
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
}

function closeJob()
{
	$(".addJobDialog").dialog();
}

function addJob()
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


