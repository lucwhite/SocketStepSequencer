var socket;
var rVal = 0;
var gVal = 0;
var bVal = 0;

function setup(){
	createCanvas(200,200);
	background(51);
	rVal = random(255);
	gVal = random(255);
	bVal = random(255);
	socket = io.connect('http://localhost:3000');
	socket.on('mouse', newDrawing);
}


function newDrawing(data){
	noStroke();
	fill(data.r, data.g, data.b);
	ellipse(data.x, data.y, 20, 20);
}

function mouseDragged(){
	var data = {
		x: mouseX,
		y: mouseY,
		r: rVal,
		g: gVal,
		b: bVal,
	};

	socket.emit('mouse', data)

	noStroke();
	fill(255);
	ellipse(mouseX, mouseY, 20, 20);
}

function draw(){

}