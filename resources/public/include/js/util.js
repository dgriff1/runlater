
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

