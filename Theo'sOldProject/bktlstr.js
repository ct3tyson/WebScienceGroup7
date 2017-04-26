// server init + mods
var express = require('express');
var app = express();
var http = require('http');
var fs = require('fs');
var path = require('path');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var randomstring = require("randomstring");

//database modules
var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code,
    assert = require('assert');
	
//mongodb bktlstr db url	
var url = 'mongodb://localhost:27017/bktlstr';	


//cookies and body parser implementation
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//app.use(express.static(__dirname + '/public'));
//allow usage of static files for external css and js
app.use(express.static(path.join(__dirname, 'public')));


// server route handler
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');

});

//get page for getting user logged in via cookies
app.get('/user', function(req,res) {
	res.send(req.cookies.user);
});


//post request for getting a user logged in
app.post('/login',function(req,res){
  var user_name=req.body.user;
  res.cookie('user', user_name);
  res.end("yes");
});

//logout page for clearing user cookies
app.get('/logout', function(req,res) {
	res.clearCookie('user');
	res.writeHead(307, {'Location':'/index.html'});
	res.end();
});

//mongodb find user function
var findUser = function(db, user,data,callback) {
	var cursor = db.collection('users').find({"userName": user});
	cursor.each(function(err,doc) {
		assert.equal(err,null);
		if (doc != null) {
			data.push(doc);
		}else {
			callback();
		}
	});
}

//mongodb get bucketlist function
var getList = function(db, user,data, callback) {
	var cursor = db.collection(user).find();
	cursor.each(function(err,doc) {
		assert.equal(err,null);
		if (doc != null) {
			data.push(doc);
		}else {
			callback();
		}
	});
}

//mongodb get public bucketlist function
var browsePublic = function(db, search, searchBy, data,callback) {
	if (searchBy == 'user') {
		var cursor = db.collection('public').find({user : new RegExp(search)});
	}else {
		var cursor = db.collection('public').find({name: new RegExp(search)});
	}
	cursor.each(function(err,doc) {
		assert.equal(err,null);
		if (doc != null) {
			data.push(doc);
		}else {
			callback();
		}
	});
}

//gets data from the index.html and functions accordingly
io.on('connection', function(socket) {
	//browse data
	socket.on('searchThis', function(search, searchBy) {
		MongoClient.connect(url, function(err,db) {
			var data = [];
			assert.equal(null,err);
			browsePublic(db,search,searchBy,data,function() {
				db.close();
				socket.emit('browseRes',data);
			})
		});
	});
	
	//end browse
	
	
	//profile data
	socket.on('changePass', function(opass,pass,user) {
		MongoClient.connect(url, function(err, db) {
			var data = [];
			assert.equal(null, err);
			findUser(db, user,data,function() {
				db.close();
				if (data[0]['password'] == crypto.createHash('md5').update(opass+data[0]['salt']).digest("hex")) {
					MongoClient.connect(url, function(err, db) {
						assert.equal(null,err);
						var newsalt = randomstring.generate( {
							length: 16,
							charset: 'alphabetic'
						});
						db.collection('users').updateOne(
						{ "userName" : user },
						{
								$set: {	password: crypto.createHash('md5').update(pass+newsalt).digest("hex"),
									salt: newsalt
								}
						});
						db.close();
						
					});
					socket.emit('cPassRes', "Your Password has changed.");
				}else {
					socket.emit('cPassRes', 'The Old Password is incorrect!');
				}
			});
		});
	});
	//edit profile via mongodb update
	socket.on('editProfile', function(data) {
		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);
			db.collection('users').updateOne(
			{ "userName" : data.username },
			{
				$set: { first_name : data.firstname,
						last_name : data.lastname,
						email: data.email,
						country: data.country,
						state: data.state,
						zip: data.zip
						}
			});
			db.close();
		});
	});
	//get user data
	socket.on('getUser', function(name) {
		var data = [];
		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);
			findUser(db, name,data,function() {
				db.close();
				socket.emit('userData', data[0]);
			});
		});
	});
	//endprofile
	
	//bucketlist
	//make items public
	socket.on('makePublic', function(item) {
		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);
			var collection = db.collection('public');
			collection.insert(item);
			db.close();
		});
	});
	//add item to user bucketlist
	socket.on('addItem', function(item) {
		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);
			var collection = db.collection(item.user);
			collection.insert(item);
			db.close();
		});
	});
	//edit item of user bucketlist
	socket.on('editItem',function(item) {
		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);
			db.collection(item.user).updateOne(
			{ "name" : item.name },
			{
				$set: { "complete": item.bool}
			});
			db.close();
		});
	});
	//remove item from user bucketlist
	socket.on('removeItem', function(item) {
		MongoClient.connect(url, function(err,db) {
			assert.equal(null,err);
			db.collection(item.user).deleteOne(
			{ "name" : item.name}
			);
			db.close();
		});
	});
	//get whole bucketlist
	socket.on('getList', function(list) {
		var data = [];
		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);
			getList(db, list,data,function() {
				db.close();
				socket.emit('receiveList',data);
			});
		});
		
	});
	
	//end bucketlist
	
	
	//login
	//check if user and password combo is correct
	socket.on('loginUser', function(user) {
		var data = [];
		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);
			findUser(db, user['userName'],data,function() {
				db.close();
				if (data[0] == null) {
					socket.emit('loginCheck', false);
				}else if (data[0]['password'] == crypto.createHash('md5').update(user['password']+data[0]['salt']).digest("hex")) {
					socket.emit('loginCheck', true);
				}else {
					socket.emit('loginCheck', false);
				}
			});
		});
		
	});
	//end login
	
	//signup 
	
	//mongodb store user data into database
	socket.on('userData', function(user_data) {
		
		MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
	
		var cursor = db.collection("users").find({"userName": user_data['userName']});
		cursor.count(function(error, size) {
			if (size == 0) {
				var collection = db.collection("users");
				var insert_user_d = user_data;
				insert_user_d['salt'] = randomstring.generate( {
					length: 16,
					charset: 'alphabetic'
				});
				insert_user_d['password'] = crypto.createHash('md5').update(user_data['password']+insert_user_d['salt']).digest("hex");
				collection.insert(insert_user_d);
				socket.emit('userNameCheck', true);
			}else {
				socket.emit('userNameCheck', false);
			}
			
		});
	
		db.close;
		});
			
	});	
	//end signup
	
});

//run server on port 3000
server.listen(3000);
console.log("Server running on :3000");