var socket=io();

//start app
angular.module('app',[]).controller('results', function($scope) {
//simple angular module to get all items related to search from public
//bucket list	
$scope.search = function() {
	var searchBy = document.getElementById("searchBy").value;
	var search = document.getElementById("search").value;
	socket.emit('searchThis',search,searchBy);
}	
	
socket.on('browseRes', function(result) {
	$scope.$apply(function() {
		console.log(result);
		$scope.list = result;
	});
});
	
});