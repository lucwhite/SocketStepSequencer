
var socket;
var grid = [];
var curstep;
var theloop;
var started = false;
var colR;
var colG;
var colB;
var keys;

var notes; //Note array
var basenote = 50; // MIDI pitch of lowest note
// scales to build 'notes' array:
var majorpat = [2, 2, 1, 2, 2, 2, 1]; // major scale
var minorpat = [2, 1, 2, 2, 1, 2, 2]; // major scale
var pentpat = [3, 2, 2, 3, 2]; // pentatonic scale
var scalepat = majorpat;

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

document.getElementById('startButton').addEventListener('click', async () => {
	console.log('audio is ready');
	document.getElementById('startButton').style.backgroundColor = "#b3ffb3";
	document.getElementById('startButton').style.color = "#000000";
	document.getElementById('stopButton').style.backgroundColor = "#333333";
	document.getElementById('stopButton').style.color = "#ffffff";
	theloop.start();
});
document.getElementById('stopButton').addEventListener('click', async () => {
	console.log('audio is stopped');
	document.getElementById('startButton').style.backgroundColor = "#333333";
	document.getElementById('startButton').style.color = "#ffffff";
	document.getElementById('stopButton').style.backgroundColor = "#df5757";
	document.getElementById('stopButton').style.color = "#ffffff";
	theloop.stop();
});
document.getElementById('clearButton').addEventListener('click', async () => {
	console.log('grid is cleared');
	socket.emit('clearAll', null);
});
document.getElementById('major').addEventListener('click', async () => {
	console.log('Major Scale');
	scalepat = majorpat;
	initScale();
	document.getElementById('major').style.backgroundColor = "#99ddff";
	document.getElementById('minor').style.backgroundColor = "#f2f2f2";
	document.getElementById('pent').style.backgroundColor = "#f2f2f2";
	//socket.emit('major', null);
});
document.getElementById('minor').addEventListener('click', async () => {
	console.log('Minor Scale');
	scalepat = minorpat;
	initScale();
	document.getElementById('major').style.backgroundColor = "#f2f2f2";
	document.getElementById('minor').style.backgroundColor = "#99ddff";
	document.getElementById('pent').style.backgroundColor = "#f2f2f2";
	//socket.emit('minor', null);
});
document.getElementById('pent').addEventListener('click', async () => {
	console.log('Pentatonic Scale');
	scalepat = pentpat;
	initScale();
	document.getElementById('major').style.backgroundColor = "#f2f2f2";
	document.getElementById('minor').style.backgroundColor = "#f2f2f2";
	document.getElementById('pent').style.backgroundColor = "#99ddff";
	//socket.emit('minor', null);
});
document.getElementById('bpm').addEventListener('input', e => {
	Tone.Transport.bpm.rampTo(+e.target.value, 0.1)
  });


function setup(){
	initScale();
	colR = random(100,255);
	colG = random(100,255);
	colB = random(100,255);
	createCanvas(1000,800);
	background(51);
	textSize(30);
	fill(255);
	translate(10,10);
	rotate(radians(90));
	text("Synth", 0,0);
	translate(345,0);
	text("Percussion", 0,0);
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
 	theloop = new Tone.Sequence(sequenceStep, tc, "8n");
 	

}

function initScale(){
	notes = new Array(8);
	var sptr = 0;
	notes[0] = basenote;
	for(var j = 1;j<notes.length;j++)
	{
	  notes[j] = notes[j-1]+scalepat[sptr];
	  sptr = (sptr+1) % scalepat.length;
	}
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
	  n.push(Tone.Midi(notes[7-i]).toFrequency());
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
	fill(150);
	text('Kick',45,390);
	text('Snare',45,432);
	text('Low Tom',45,474); //474
	text('Hi Tom',45,516); //516
	text('Closed Hat',45,558); //558
	text('Open Hat',45,600); //600
	text('Clap',45,642); //642
	text('Ride',45,684); //684
}

function display(data, index){
	noStroke();
	if ((index%16-curstep) == 0){
		fill(data.colR-30,data.colG-30,data.colB-30);
	}else{
		fill(data.colR,data.colG,data.colB);
	}
	rect(data.x, data.y, 40, 40);
}

