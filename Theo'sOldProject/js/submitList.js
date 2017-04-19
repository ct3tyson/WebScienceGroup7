//socket
var socket = io();

$("#submit").click(function() {
	var userName = $('#userName').val();
	var password = $('#password').val();
	var cpassword = $('#password_confirmation').val();
	var first_name = $('#first_name').val();
	var last_name = $('#last_name').val();
	var email = $('#email').val();
	var country = $('#country').val();
	var state = $('#state').val();
	var zip = $('#zip').val();
	
	
	
	if (userName == '' || email == '' || password == '' || cpassword == '' 
	|| first_name == '' || last_name == '' || country == '' || state == '' || 
	zip == '') {
		alert("Please fill all fields...!!!!!!");
	}else if ((password.length) < 8) {
		alert("Password should atleast 8 character in length...!!!!!!");
	}else if (!(password).match(cpassword)) {
		alert("Your passwords don't match. Try again?");
	}else {
		
		
		var user_data = {
			'userName': userName,
			'password': password,
			'first_name': first_name,
			'last_name': last_name,
			'email': email,
			'country': country,
			'state': state,
			'zip':zip
				
		};
		socket.emit('userData', user_data);
		
				
		socket.on('userNameCheck', function(check){
			if (!check) {
				alert('username was taken!');
			}else {
				alert('made an account');
				window.location.href = "login.html";
			}
		});
		
		
		
		
		
		
		
	}
	
});