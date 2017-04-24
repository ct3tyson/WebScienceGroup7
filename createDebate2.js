var socket=io();


angular.module('app',[]).controller('debateController', function($scope, $http) {
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

    $scope.createDebate = function() {
  var debate = {
    topic: document.getElementById("debateTopic").value,
    data: document.getElementById("newDebate").value,
    user: $scope.user,
    time: new Date(),
  }
  socket.emit('createDebate',debate);
  getmdblist();
}