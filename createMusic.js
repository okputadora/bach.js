const mongoose = require('mongoose');
const nGram = require('./models/Ngram');
const scribble = require('scribbletune');
const distance = require('tonal-distance');

const DURATIONS = {
  '16th': 'x',
  'eighth': "x-",
  'quarter': 'x---',
  'half': 'x-------',
  'whole': 'x---------------',
}

const numberOfMeasures = 10;
let nGrams = {};
mongoose.connect('mongodb://localhost/classicalMusic', async (err, res) => {
  if (err){console.log('DB CONNECTION FAILED: '+err)}
  else{console.log('DB CONNECTION SUCCESS')}
  nGram.findOne({artist: "Bach"})
  .then(res => {
    nGrams = res.nGrams;
    generateSong()
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
  flattened = song.reduce((acc, val) => acc.concat(val), [])
  transposed = flattened.map(note => {
    return {note: distance.transpose("C3", note.note), duration: note.duration};
  })
  parseToMusic(transposed)
}

function parseToMusic(song){
  let clip = scribble.clip({
    notes: song.map(note => note.note.toLowerCase()).join(' '),
    pattern: song.map(note => DURATIONS[note.duration]).join('')
  })
  scribble.midi(clip, 'THIRD.mid');
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