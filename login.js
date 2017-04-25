//socket
var socket = io();

$("#submit").click(function() {
	var userName = $('#userName').val();
	var password = $('#password').val();
	
	
	//makes sure fields aren't empty cause if it is
	//well it wouldn't/shouldn't work
	if (userName == '' || password == '' ) {
		document.getElementById("error").innerHTML = "Please fill out all fields.";
	}else {
		
		
		var user_data = {
			'userName': userName,
			'password': password,
		};
		//check if user data is correct
		socket.emit('loginUser', user_data);
		//if so sends post request with user to be logged in.
		socket.on('loginCheck', function(check){
			if (!check) {
				document.getElementById("error").innerHTML = 'Username or password is incorrect!';
			}else {
				$.post("http://localhost:3000/login", {user:userName}, function(data) {
					if(data==='done') {
						alert("login success");
					}
				});
				//redirect to different page
				window.location.href = "home.html";
			}
		});
		
		
		
	}
	
});
