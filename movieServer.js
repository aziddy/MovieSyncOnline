var express = require('express');
var app = express();
var path = require('path');
var fs = require("fs");
var http = require('http').Server(app);
var io = require('socket.io')(http);
var base64 = require('base-64');
var utf8 = require('utf8');

var connectedUsers = new Array();
var allUserLatency = new Array();

app.set('view engine', 'ejs');

// server-client-server RTT
var timeThing;
var startTime;


var torrentStream = require('torrent-stream');
 
var engine = torrentStream('magnet:?xt=urn:btih:f73a9012655bc2b4f33f4de98965e9fcfd1f27ab&dn=Riverdale.US.S03E14.HDTV.x264-SVA%5Bettv%5D&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Fzer0day.ch%3A1337&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969');
var streamy;
 
 
engine.on('ready', function() {
	
	console.log('filename:', engine.files[1].name);
	console.log('filename:', engine.files[1].length);
	streamy = engine.files[1].createReadStream();
	

});

//var engine;






/*
app.use(express.static('public'))
app.get('/:magnet', function(req, res) {
	engine = torrentStream('magnet:?xt=urn:btih:f73a9012655bc2b4f33f4de98965e9fcfd1f27ab&dn=Riverdale.US.S03E14.HDTV.x264-SVA%5Bettv%5D&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Fzer0day.ch%3A1337&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969');
	engine.on('ready', function() {
		var HTMLtoSend = "";
		//console.log('filename:', engine.files[1].name);
		HTMLtoSend += engine.files[1].name;
		HTMLtoSend += "<br>";
		HTMLtoSend += engine.files[1].length;
		HTMLtoSend += "<br>";
		res.send(HTMLtoSend);
		//console.log('filename:', engine.files[1].length);
		//streamy = engine.files[1].createReadStream();	
	});
});
*/


// Actual Video Player
app.get('/videoPlayer',function(req,res){
	res.sendFile(__dirname + '/videoPlayer.html');
});


app.get('/enterMagnet',function(req,res){
	res.sendFile(__dirname + '/enterMagnet.html');
});

app.get('/selectVideoFile/:magnet',function(req,res){
	
	var decodedB64 = base64.decode(req.params.magnet);
	
	
	
	
	
	
	var engine2 = torrentStream(decodedB64);
 
	engine2.on('ready', function() {
		
		var HTMLstirng = "";
		
		for(var x = 0; x < engine2.files.length; x++){
			HTMLstirng += "<div id='" + x + "' style='margin-top:10px'>"
			HTMLstirng += engine2.files[x].name;
			HTMLstirng += "</br>";
			
			HTMLstirng += engine2.files[x].length;
			HTMLstirng += "</br>";
			HTMLstirng += "</div>";
		}
		
		
		console.log('filename:', engine2.files[1].name);
		console.log('filename:', engine2.files[1].length);
		
		res.send(HTMLstirng);
	});
});


app.get('/videoPlayer2',function(req,res){
	
	
	var data = {
		magnet: base64.encode('yeet'),
	};
	
	res.render('videoPlayer2', data);
});

// Upload Videos to Server
app.get('/videoUpload',function(req,res){
	
});


// Prints out directory of Videos on Server
app.get('/videoDirectory',function(req,res){
	
});


// Handles Video Streaming
/*
app.get('/videoStream/:videoFileName', function(req, res) {
    const path = __dirname + "/www/videos/" + req.params.videoFileName;
    const stat = fs.statSync(path)
    const fileSize = stat.size
    const range = req.headers.range
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1] ?
            parseInt(parts[1], 10) :
            fileSize - 1
        const chunksize = (end - start) + 1
        const file = fs.createReadStream(path, {
            start,
            end
        })
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(200, head)
        fs.createReadStream(path).pipe(res)
    }
});
*/
app.get('/videoStream/:videoFileName', function(req, res) {


    const fileSize = engine.files[1].length;
    const range = req.headers.range
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1] ?
            parseInt(parts[1], 10) :
            fileSize - 1
        const chunksize = (end - start) + 1
        const file = engine.files[1].createReadStream({
            start,
            end
        })
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(200, head)
        engine.files[1].createReadStream().pipe(res)
    }
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

	
	socket.on('setCurrentVideoTime', function(msg) {
		io.emit('updateCurrentVideoTime', msg);
	});
	
	socket.on('setCurrentVideoPlay', function(msg) {
		io.emit('updateCurrentVideoPlay', msg);
	});
	
	socket.on('setCurrentVideoPause', function(msg) {
		io.emit('updateCurrentVideoPause', msg);
	});











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
		//console.log(serverToClientDifferences);

		// dividend
		var averageDividend = 0;
		var averageDividendServerToClient = 0;

		for (var x = 0; x < serverToClientDifferences.length; x++) {
			averageDividendServerToClient += serverToClientDifferences[x];
		}

		// divisor
		if (serverToClientDifferences.length >= 10) {
			serverToClientAverage = averageDividendServerToClient / serverToClientDifferences.length;
			//console.log(serverToClientAverage);
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
