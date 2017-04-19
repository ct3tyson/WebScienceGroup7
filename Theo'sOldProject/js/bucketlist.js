var socket=io();


angular.module('app',[]).controller('BucketListController', function($scope, $http) {
	  $scope.user = '';
	  var getmdblist = function() {
		socket.emit('getList', $scope.user);
	}
	//get user logged in
    $http({
      method: 'GET',
      url: 'http://localhost:3000/user'
    }).then(function successCallback(response) {
      $scope.user = response.data;
	  getmdblist();
    }, function errorCallback(response) {
      console.log(response);
    });
	
	
//add item to user bucketlist
$scope.addItem = function() {
	var item = {
		name: document.getElementById("new-task").value,
		user: $scope.user,
		time: new Date(),
		complete: false
	}
	socket.emit('addItem',item);
	getmdblist();
}
//edit item in user bucketlist
$scope.editItem = function(item) {
	var changeto = false;
	if (item.complete == false) {
		changeto = true;
	}
	var item = {
		user: $scope.user,
		name: item.name,
		bool: changeto
	}
	socket.emit('editItem',item);
	getmdblist();
}
//remove item in user bucketlist
$scope.removeItem = function(itemName) {
	var item = {
		user: $scope.user,
		name: itemName
	}
	socket.emit('removeItem',item);
	getmdblist();
}
//make item public storing user name, time, and the item itself
$scope.makePublic = function(item) {
	var send = {
		name: item.name,
		user: item.user,
		time: item.time,
		complete: false
	}
	socket.emit('makePublic',send);
}

socket.on('receiveList',function(list){
	$scope.$apply(function() {
		$scope.items = list;
	});
 
})
 
});


