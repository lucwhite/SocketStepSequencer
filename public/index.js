
var socket;
var grid = [];
var curstep;
var theloop;
var started = false;
var colR;
var colG;
var colB;
var keys;

var percs = [];
var players = [];

percs[0] = '/sounds/kick.wav';
percs[1] = '/sounds/snare.wav';
percs[2] = '/sounds/tom.wav';
percs[3] = '/sounds/tom2.wav';
percs[4] = '/sounds/chat.wav';
percs[5] = '/sounds/ohat.wav';
percs[6] = '/sounds/clap.wav';
percs[7] = '/sounds/ride.wav';

for(i=0; i<8; i++){
	players.push(new Tone.Player(percs[i]).toDestination());
	players[i].volume.value = -17;
}




//var synth = new Tone.Synth().toDestination();
//import * from 'tone';

document.getElementById('foo').addEventListener('click', async () => {
	console.log('audio is ready');
	theloop.start();
});
document.getElementById('bar').addEventListener('click', async () => {
	console.log('audio is stopped');
	theloop.stop();
});
document.getElementById('clearButton').addEventListener('click', async () => {
	console.log('grid is cleared');
	socket.emit('clearAll', null);
});


function setup(){
	colR = random(100,255);
	colG = random(100,255);
	colB = random(100,255);
	createCanvas(1000,800);
	background(51);
	socket = io();
	socket.on('mouse', minitialize);
	socket.on('init', initialize);
	socket.on('clearAll', initialize);
	//Reverb
	var freeverb = new Tone.Freeverb(0.8, 10000).toDestination();
  	freeverb.wet.value = 0.25;
 	 // synthesizer:
 	keys = new Tone.PolySynth(Tone.SimpleSynth).connect(freeverb);
	keys.set({maxPolyphony: 16});
	  
	var tc = new Array(16);
  	for(var k = 0;k<tc.length;k++)
 	 {
  	  tc[k] = k;
 	 }

  	// sequencer:
 	Tone.Transport.bpm.value = 120;
 	Tone.Transport.start();
 	theloop = new Tone.Sequence(sequenceStep, tc, "16n");
 	

}

function initialize(data){
	grid = data;
	for(var h = 0; h < grid.length; h++){
		display(grid[h], h);
	}
	
}
function minitialize(data){
	grid = data;
	for(var h = 0; h < grid.length; h++){
		display(grid[h], h);
	}
	console.log('recieved');
}

function sequenceStep(time, step)
{
  initialize(grid);
  curstep = step;
  var n = [];
  for(var i = 0;i<8;i++)
  {
    if(grid[(i*16) + step].state)
    {
	  n.push(Tone.Midi((i*3)+50).toFrequency());
	  display(grid[(i*16)+step], i*16+step);
    }
  }
  for(var i = 8;i<16;i++)
  {
    if(grid[(i*16) + step].state)
    {
	  players[i-8].start();
	  display(grid[(i*16)+step], i*16+step);
    }
  }
  keys.triggerAttackRelease(n, "4n", time, random(0.1, 0.2));
}

function gridChange(data){
	for(var h = 0; h < grid.length; h++){
		display(grid[h], h);
	}
}

function mousePressed(){
	if(!started){
	Tone.start();
	};
	var data = {
		x: mouseX,
		y: mouseY,
		r: colR,
		g: colG,
		b: colB
	};
	console.log('sent');
	socket.emit('mouse', data);
	//synth.triggerAttackRelease("C4", "4n");
}

function draw(){
	
}

function display(data, index){
	noStroke();
	if ((index%16-curstep) == 0){
		fill(data.colR+30,data.colG+30,data.colB+30);
	}else{
		fill(data.colR,data.colG,data.colB);
	}
	rect(data.x, data.y, 40, 40);
}

