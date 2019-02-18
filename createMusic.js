const mongoose = require("mongoose");
const distance = require("tonal-distance");
const nGram = require("./models/Ngram");
const fs = require("fs");
const MidiWriter = require("midi-writer-js");

let globalCounter = 0;
// Convert mxl time to tone.js time
const DURATIONS = {
  "32nd": "32",
  "16th": "16",
  eighth: "8",
  quarter: "4",
  half: "2",
  whole: "1"
};

const numberOfMeasures = 30;
let nGrams = {};
mongoose.connect("mongodb://localhost/classicalMusic", async (err, res) => {
  if (err) {
    console.log("DB CONNECTION FAILED: " + err);
  } else {
    console.log("DB CONNECTION SUCCESS");
  }
  let files = [];
  nGram.findOne({ artist: "Bach" }).then(res => {
    nGrams = res.nGrams;
    for (let i = 0; i < 100; i++) {
      let song = generateSong();
      let file = parseToMidi(song);
      files.push(file);
    }
    console.log(files);
    Promise.all(files.map((file, i) => writeFile(file, i))).then(res => {
      mongoose.connection.close();
    });
  });
});

function writeFile(file, i) {
  return new Promise((resolve, reject) => {
    fs.writeFile(`./bach/test-${i}.mid`, file, function(err) {
      if (err) {
        reject();
        // return console.log(err);
      }
      console.log("The file was saved!");
      resolve();
    });
  });
}

function generateSong() {
  // Pick a random key
  // Pick a random first bar
  let chunks = Object.keys(nGrams);
  let chunk = chunks[Math.floor(Math.random() * chunks.length)];
  let parsedChunk = parseChunk(chunk);
  let song = getNextChunk(chunk, numberOfMeasures, [parsedChunk]);
  return song;
  // let nextKeys = Object.keys(nextChunk)
  // console.log("Next chunks ", nGrams[chunk])
  // console.log(nextChunk)
  // console.log(nextKeys)
  // console.log(parsedChunk)
}

function getNextChunk(currentChunk, numberOfMeasures, acc) {
  let nextChunks = nGrams[currentChunk];
  let highCount = 0;
  let most = "";
  // check for most occurences
  for (key in nextChunks) {
    if (nextChunks[key] > highCount) {
      highCount = nextChunks[key];
      most = key;
    }
  }
  acc.push(parseChunk(most));
  numberOfMeasures--;
  if (numberOfMeasures > 0) {
    return getNextChunk(most, numberOfMeasures, acc);
  } else {
    // console.log(acc);
    return transpose(acc);
  }
}

function transpose(song) {
  transposed = song
    .reduce((acc, val) => acc.concat(val, []))
    .map(note => {
      if (!DURATIONS[note.duration]) {
      }
      return {
        note: distance.transpose("F#3", note.note),
        duration: DURATIONS[note.duration]
      };
    });
  return transposed;
}

function parseToMidi(song) {
  // Start with a new track
  let track = new MidiWriter.Track();

  // Define an instrument (optional):
  track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));

  // Add some notes:
  song.forEach(note => {
    let midiNote = new MidiWriter.NoteEvent({
      pitch: [note.note],
      duration: note.duration
    });
    track.addEvent(midiNote);
    // console.log(note);
  });
  // console.log(track);
  // Generate a data URI
  let file = new MidiWriter.Writer(track).buildFile();
  return file;
}

function parseChunk(chunk) {
  chunkArr = chunk.split("&");
  return chunkArr.slice(0, chunkArr.length - 1).map(note => ({
    note: note.split("@")[0],
    duration: note.split("@")[1]
  }));
}
