var express = require('express');
var app = express();
var path = require('path');
var fs = require("fs");
var http = require('http').Server(app);
var io = require('socket.io')(http);

var connectedUsers = new Array();
var allUserLatency = new Array();

// server-client-server RTT
var timeThing;
var startTime;







app.use(express.static('public'))
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/buzzindex.html');
});



// Actual Video Player
app.get('/videoPlayer',function(req,res){
	
});


// Upload Videos to Server
app.get('/videoUpload',function(req,res){
	
});


// Prints out directory of Videos on Server
app.get('/videoDirectory',function(req,res){
	
});


// Handles Video Streaming
app.get('/videoStream/:videoFileName',function(req,res){
	var requestedHub = req.params.videoFileName;
});







io.on('connection', function(socket) {
	
	
	
	// CONNECTED USER STUFF
	
	var userid = Math.round(Math.random() * 1000);
	io.to(socket['id']).emit("you", socket['id']);

	var serverToClientDifferences = new Array();
	var serverToClientAverage = 0;

	allUserLatency.push([socket['id'], 0]);
	io.emit('connectedUsers', {
		users: Object.keys(io.sockets.sockets)
	});

	console.log("User Connected");

	socket.on('disconnect', function() {
		console.log("disconnected");

		for (var x = 0; x < allUserLatency.length; x++) {

			if (socket['id'] == allUserLatency[x][0]) {
				allUserLatency.splice(x, 1);
			}
		}
		io.emit('connectedUsers', {
			users: Object.keys(io.sockets.sockets)
		});
	});



	// MOVIE SYNC

	











	// PING STUFF

	socket.on('startRTT', function(msg) {
		if (serverToClientDifferences.length >= 10) {
			serverToClientDifferences.splice(0, serverToClientDifferences.length);
		}

		// START server to client roundabout
		timeThing = new Date();
		startTime = timeThing.getTime();
		io.to(socket['id']).emit("latencytest2", startTime);

	});

	socket.on('latencytest2', function(msg) {

		var nowTimeThing = new Date();
		var nowTime = nowTimeThing.getTime();

		serverToClientDifferences.push((nowTime - startTime));
		console.log(serverToClientDifferences);

		// dividend
		var averageDividend = 0;
		var averageDividendServerToClient = 0;

		for (var x = 0; x < serverToClientDifferences.length; x++) {
			averageDividendServerToClient += serverToClientDifferences[x];
		}

		// divisor
		if (serverToClientDifferences.length >= 10) {
			serverToClientAverage = averageDividendServerToClient / serverToClientDifferences.length;
			console.log(serverToClientAverage);
			for (var z = 0; z < allUserLatency.length; z++) {
				if (socket['id'] == allUserLatency[z][0]) {
					allUserLatency[z][1] = serverToClientAverage;
				}
			}
			io.to(socket['id']).emit("pingDelay", serverToClientAverage);
		}
	});


});

http.listen(2999, function() {
	console.log('listening on *:2999');
	console.log(__dirname);
});
