2// global constants
const cluePauseTime = 333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence

//Global Variables
var progress = 0;
var pattern = [];
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.5; //must be between 0.0 and 1.0
var guessCounter = 0;
var clueHoldTime = 1000; //how long to hold each clue's light/sound
var mistake = 8;
var distance = 0;
var x = null;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function generatePattern(num) {
  for(var i = 0; i < num; i++){
    pattern.push(getRandomInt(1,6));
  } 
  return pattern;
}
function startTimer(gameTimeSEC) {  
  // Set the date we're counting down to
  var countDownDate = new Date();
  countDownDate.setSeconds( countDownDate.getSeconds() + gameTimeSEC );
 //Update the count down every 1 second
  x = setInterval(function() {

  // Get today's date and time
  var now = new Date().getTime();
    
  // Find the distance between now and the count down date
  distance = countDownDate - now;
    
  // Time calculations for seconds
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
  // Output the result in an element with id="demo"
  document.getElementById("demo").innerHTML = seconds + "s ";
    
  // If the count down is over, write some text 
  if (distance < 0) {
    mistake = 0;
    loseGame();
    document.getElementById("demo").innerHTML = "EXPIRED";
  }
}, 1000);

}

function startGame() {
  //initialize game variables
  mistake = 3;
  document.getElementById("lives").innerHTML = mistake + " lives";
  if(!gamePlaying)
    startTimer(60);
  progress = 0;
  gamePlaying = true;
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  generatePattern(5);  
  playClueSequence();
}
function stopGame() {
  //initialize game variables
  gamePlaying = false;
  clearInterval(x);
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
}
// Sound Synthesis Functions
const freqMap = {
  1: 261.6,
  2: 329.6,
  3: 392,
  4: 466.2,
  5: 492,
  6: 530
};
function playTone(btn, len) {
  console.log(o,g);
  o.frequency.value = freqMap[btn];
  g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
  tonePlaying = true;
  setTimeout(function() {
    stopTone();
  }, len);
}
function startTone(btn) {
  if (!tonePlaying) {
    o.frequency.value = freqMap[btn];
    g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
    tonePlaying = true;
  }
}
function stopTone() {
  g.gain.setTargetAtTime(0, context.currentTime + 0.05, 0.025);
  tonePlaying = false;
}

//Page Initialization
// Init Sound Synthesizer
var context = new AudioContext();
var o = context.createOscillator();
var g = context.createGain();
g.connect(context.destination);
g.gain.setValueAtTime(0, context.currentTime);
o.connect(g);
o.start(0);

function lightButton(btn) {
  document.getElementById("button" + btn).classList.add("lit");
}
function clearButton(btn) {
  document.getElementById("button" + btn).classList.remove("lit");
}

function playSingleClue(btn) {
  if (gamePlaying) {
    lightButton(btn);
    playTone(btn, clueHoldTime);
    setTimeout(clearButton, clueHoldTime, btn);
  }
}
function playClueSequence() {
  guessCounter = 0;
  let delay = nextClueWaitTime; //set delay to initial wait time
  for (let i = 0; i <= progress; i++) {
    // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms");
    setTimeout(playSingleClue, delay, pattern[i]); // set a timeout to play that clue
    delay += clueHoldTime;
    delay += cluePauseTime;
  }
  clueHoldTime -= 100;
}
function loseGame() {
  if(mistake == 0) {
    stopGame();
    alert("Game Over. You lost.");
  }
  else {
    mistake--;
    document.getElementById("lives").innerHTML = mistake + " lives";
  }
}
function winGame() {
  stopGame();
  alert("Game Over. You won.");
  document.getElementById("demo").innerHTML = "You won!!";
}

function guess(btn) {
  console.log("user guessed: " + btn);
  if (!gamePlaying) {
    return;
  }
  if (pattern[guessCounter] == btn) {
    //Guess was correct!
    if (guessCounter == progress) {
      if (progress == pattern.length - 1) {
        //GAME OVER: WIN!
        winGame();
      } else {
        //Pattern correct. Add next segment
        progress++;
        playClueSequence();
      }
    } else {
      //so far so good... check the next guess
      guessCounter++;
    }
  } else {
    //Guess was incorrect
    //GAME OVER: LOSE!
    loseGame();
  }
}
