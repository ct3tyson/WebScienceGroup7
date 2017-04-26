/*var socket=io();


$("#debate").click(function() {
  var debateTopic = $('#debateTopic').val();
  var debateBio = $('#newDebate').val();
  
  
  //makes sure fields aren't empty cause if it is
  //well it wouldn't/shouldn't work
  if (debateTopic == '' || debateBio == '' ) {
    document.getElementById("error").innerHTML = "Please fill out all fields.";
  }else {
    
    var user_data = {
      'topic': debateTopic,
      'debate': debateBio,
    };
    //check if user data is correct
    socket.emit('user_debate_data', user_debate_data);
    
    socket.on('debateCheck', function(check){
      if (!check) {
        document.getElementById("error").innerHTML = 'Debate is already being talked about!';
      }else {
        document.getElementById("error").innerHTML = 'Debate Created!';

          }
        });
        //redirect to different page
       
      }
    });
    */

//<textarea type="textarea" id="newDebate" data-min-length="10" ng-required placeholder="What's your debate? If you cant think of anything... So about chicken tenders and chicken nuggets..."></textarea>

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
  
  
//add item to user bucketlist
$scope.addDebate = function() {
  var item = {
    topic: document.getElementById("debateTopic").value,
    debate: document.getElementById("newDebate").value,
    user: $scope.user,
    time: new Date()
  }
  socket.emit('addDebate',item);
  getmdblist();
}

socket.on('receiveList',function(list){
  $scope.$apply(function() {
    $scope.items = list;
  });
 
})
 
});
