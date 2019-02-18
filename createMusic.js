const mongoose = require('mongoose');
const distance = require('tonal-distance');
const nGram = require('./models/Ngram');
let globalCounter = 0;
// Convert mxl time to tone.js time
const DURATIONS = {
  '16th': '16n',
  'eighth': "8n",
  'quarter': '4n',
  'half': '2n',
  'whole': '1n',
}

const numberOfMeasures = 10;
let nGrams = {};
mongoose.connect('mongodb://localhost/classicalMusic', async (err, res) => {
  if (err){console.log('DB CONNECTION FAILED: '+err)}
  else{console.log('DB CONNECTION SUCCESS')}
  nGram.findOne({artist: "Bach"})
  .then(res => {
    nGrams = res.nGrams;
    for (let i = 0; i < 100; i++){
      generateSong()
      globalCounter++
    }
  })
})

function generateSong() {
  // Pick a random key 
  // Pick a random first bar 
  let chunks = Object.keys(nGrams);
  let chunk = chunks[Math.floor(Math.random()*chunks.length)];
  let parsedChunk = parseChunk(chunk)
  console.log(parsedChunk)
  let song = getNextChunk(chunk, numberOfMeasures, [parsedChunk])
  // console.log("Full song: ", song)
  
  // let nextKeys = Object.keys(nextChunk)
  // console.log("Next chunks ", nGrams[chunk])
  // console.log(nextChunk)
  // console.log(nextKeys)
  // console.log(parsedChunk)
}

function getNextChunk(currentChunk, numberOfMeasures, acc) {
  let nextChunks = nGrams[currentChunk];
  let highCount = 0;
  let most = ''
  // check for most occurences
  for (key in nextChunks) {
    if ( nextChunks[key] > highCount ) {
      highCount = nextChunks[key]
      most = key
    }
  }
  console.log(highCount)
  console.log(most)

  acc.push(parseChunk(most))
  numberOfMeasures--;
  if (numberOfMeasures > 0) {
    getNextChunk(most, numberOfMeasures, acc)
  } else {
    transpose(acc)
  }
}

function transpose(song){
  transposed = song
    .reduce((acc, val) => acc.concat(val), [])
    .map(note => {
      return {note: distance.transpose("C3", note.note), duration: note.duration};
    })
  parseToMusic(transposed)
}

function parseToMusic(song){
  var part = new Tone.Part(function(time, value){
    //the value is an object which contains both the note and the velocity
    synth.triggerAttackRelease(value.note, "8n", time, value.velocity);
  }, [{"time" : 0, "note" : "C3", "velocity": 0.9},
       {"time" : "0:2", "note" : "C4", "velocity": 0.5}
  ]).start(0);
}

function parseChunk(chunk) {
  chunkArr = chunk.split('&')
  return chunkArr
    .slice(0, chunkArr.length - 1)
    .map(note => ({
      note: note.split('@')[0],
      duration: note.split('@')[1]
    }))
}