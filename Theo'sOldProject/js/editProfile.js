var socket=io();


angular.module('app',[]).controller('profile', function($scope, $http) {
	  $scope.user = '';
	  var getuserdata = function() {
		socket.emit('getUser', $scope.user);
	}
	//get user logged in
    $http({
      method: 'GET',
      url: 'http://localhost:3000/user'
    }).then(function successCallback(response) {
      $scope.user = response.data;
		getuserdata();
    }, function errorCallback(response) {
      console.log(response);
    });
//mongodb socket to change user details
$scope.editProfile = function() {
	var data = {
		username: $scope.user,
		firstname: document.getElementById("firstname").value,
		lastname: document.getElementById("lastname").value,
		email: document.getElementById("email").value,
		country: document.getElementById("country").value,
		state: document.getElementById("state").value,
		zip: document.getElementById("zip").value,
	}
	socket.emit('editProfile',data)
	location.reload();
}
//change password and returns whether old password is correct
//and if so changes it to new password and makes new salt
$scope.changePass = function() {
	var pass = document.getElementById("password").value;
	var cpass = document.getElementById("cpassword").value;
	var opass = document.getElementById("opassword").value;
	
	if (pass != cpass) {
		$scope.error = "Your passwords don't match";
	}else {
		socket.emit('changePass', opass,pass,$scope.user);
	}
}	 
//gets user data
socket.on('userData',function(data){
	$scope.$apply(function() {
		$scope.firstname = data.first_name;
		$scope.lastname = data.last_name;
		$scope.email = data.email;
		$scope.country = data.country;
		$scope.state = data.state;
		$scope.zip = data.zip;
	});
 
})
//interactive message to tell user whether password is correct or not
socket.on('cPassRes', function(result) {
	$scope.$apply(function() {
		$scope.error = result;
	});
});

 
});


