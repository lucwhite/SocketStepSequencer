var express = require('express');
var tone = require('tone');
var socket = require('socket.io');
var grid = [];
var rug = require('random-username-generator');

var app = express();
var server = app.listen(process.env.PORT || 3000);
var io = socket(server);

var onlineUsers = [];

app.use(express.static('public'));

console.log('Server is running on port 3000.');

for(var i = 0; i < 16; i++){
	for(var j = 0; j < 16; j++){
		if(i >= 8){
			var y = i*42+20;
		}else{
			var y = i*42+10;
		}
		var x = j*42+40;
		var r = 255;
		var b = 255;
		var g = 255;
		grid.push(new Step(x,y,r,g,b));
	}
}

io.sockets.on('connection', newConnection);

function newConnection(socket){
	var newUsername = rug.generate();
	socket.username = newUsername;
	onlineUsers.push(socket.username);
	socket.on('disconnect', function() {
		console.log('Got disconnect!');
  
		var i = onlineUsers.indexOf(socket);
		console.log(i);
		onlineUsers.splice(i, 1);
		io.sockets.emit('newUser', onlineUsers);
	 });
	socket.on('mouse', mouseMsg);
	socket.on('clearAll', clearMsg);
	io.sockets.emit('init', grid);
	io.sockets.emit('newUser', onlineUsers);

	function mouseMsg(data){
		for(var k = 0; k < grid.length; k++){
			grid[k].clicked(data.x, data.y, data.r, data.g, data.b);
		}

		io.sockets.emit('mouse', grid);
		console.log(data);
	}
	function clearMsg(data){
		for(var k = 0; k < grid.length; k++){
			grid[k].state = false;
			grid[k].checkState();
		}

		io.sockets.emit('clear', grid);
		console.log(data);
	}
}

function Step(x, y, r, g, b){
	this.x = x;
	this.y = y;
	this.state = false;
	this.colR = r;
	this.colG = g;
	this.colB = b;

	this.checkState = function(){
		// if(this.state == true){
		// 	this.colG = 0;
		// 	this.colB = 200;
		// }
		// else{
		// 	this.colG = 255;
		// 	this.colB = 255;
		// }
		if(this.state == false){
			this.colR = 255;
			this.colG = 255;
			this.colB = 255;
		}
	}
	this.clicked = function(inX, inY, inR, inG, inB){
		if(inX >= this.x && inX <= this.x+50 && inY >= this.y && inY <= this.y+50){
			if(this.state == false){
				this.state = true;
				this.colR = inR;
				this.colG = inG;
				this.colB = inB;
			}
			else{
				this.state = false;
				this.checkState();
			}

		}
	}
}
