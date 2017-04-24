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
	
	
	//make sure no fields are empty and password is at least 8 characterSet
	//and confirm password is same
	if (userName == '' || email == '' || password == '' || cpassword == '' 
	|| first_name == '' || last_name == '' || country == '' || state == '' || 
	zip == '') {
		document.getElementById("error").innerHTML = "Please fill out all fields.";
	}else if ((password.length) < 8) {
		document.getElementById("error").innerHTML = "Password should at least 8 character in length.";
	}else if (!(password).match(cpassword)) {
		document.getElementById("error").innerHTML = "Your passwords don't match. Try again." ;
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
		//checks if username is already taken if so tell user
		socket.emit('userData', user_data);
		//if not then it stores into database
		socket.on('userNameCheck', function(check){
			if (!check) {
				document.getElementById("error").innerHTML = 'Username was taken. Try another one.';
			}else {
				document.getElementById("error").innerHTML = 'Made an account!';
				window.location.href = "login.html";
			}
		});
		
	}
	
});