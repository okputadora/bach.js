const music = require('musicjson');
const fs = require('fs');
const distance = require('tonal-distance');
const KEYS = {
  '1': {major: 'G', minor: 'E'},
  '2': {major: 'D', minor: 'B'},
  '3': {major: 'A', minor: 'F#'},
  '4': {major: 'E', minor: 'C#'},
  '5': {major: 'B', minor: 'G#'},
  '6': {major: 'F#', minor: 'D#'},
  '-1': {major: 'F', minor: 'D'},
  '-2': {major: 'BFLAT', minor: 'G'},
  '-3': {major: 'EFLAT', minor: 'C'},
  '-4': {major: 'AFLAT', minor: 'F'},
  '-5': {major: 'DFLAT', minor: 'BFLAT'},
  '-6': {major: 'GFLAT', minor: 'EFLAT'},
}

const DURATIONS = {
  '16th': 'x',
  'eighth': "x-",
  'quarter': 'x---',
  'half': 'x-------',
  'whole': 'x---------------',
}

getPaths('./unzippedScores')
.then(res => batchParse(res))
// .then(res => console.log(res))

function getPaths(directory) { // unzippedScored
  return new Promise ((resolve, reject) => {
    fs.readdir(directory, function(err, res){
      if (err) reject(err)
      getPath(directory, res, 0, [])
      .then(res2 => {
        // console.log("RESOLVED: ", res2)
        resolve(res2)
      })
    })
  })
}

function getPath(directory, srcPaths, index, paths) {
  return new Promise((resolve, reject) => {
    Promise.all(srcPaths.map(path => {
      return new Promise((resolve, reject) => {
        fs.readdir(`${directory}/${path}`, function(err, res){
          if (err) reject(err)
          let file = res.filter(f => f.includes('.xml'))[0]
          resolve(`${directory}/${path}/${file}`)
        })
      })
    }))
    .then(res => resolve(res))
    .catch(err => reject(err))
  })
}

function batchParse(files) {
  // console.log(files[0])
  fs.readFile(files[0], 'utf8', function (err, res) {
    // console.log(res)
    music.musicJSON(res, function (err, json) {
      // Do something with the MusicJSON data
      if (err) console.log(err)
      // console.log(json['score-partwise']['part'][0]['measure'][0].note)
      let musicJson = {
        key: '',
        timeSignature: '',
        notes: [],
      
      }
      // console.log(JSON.stringify(json, null, 2))
      json['score-partwise']['part'][0]['measure'].forEach(function(measure, i){
        // console.log(measure['$'].number)
        if (measure['$'].number === '1') {
          musicJson.key = KEYS[measure.attributes.key.fifths].major
          // console.log(measure)
          musicJson.timeSignature = `${measure.attributes.time.beats}/${measure.attributes.time['beat-type']}`
          // console.log(measure.note[0])
          let end = 0;
        }
        // console.log("TEST JSON: ", testJson)
        // console.log(measure)
        if (measure.note.length > 0) {
          measure.note.forEach(function(note, x){
            // console.log("NOTE", note)
            if (note.pitch) {
              let noteName = `${note.pitch.step}${note.pitch.octave}`
              musicJson.notes.push({
                noteName: noteName, 
                duration: note.type,
              })
            }
          })
        }
      })
      // console.log(notes)
      analyze(musicJson)
    })
  })
}

function analyze(musicJson){
  musicJson.notes.forEach((note, i, arr) => {
    // console.log(i)
    note.relativeNote = distance.interval(musicJson.key, note.noteName[0]);
    note.distanceFromPrev = i > 0 ? distance.semitones(musicJson.notes[i - 1].noteName, note.noteName) : null;
  })
  console.log(musicJson)
}
  

// function readFile(){

//       // console.log(notes)
//       c = scribble.clip({
//         notes: notes.map(note => note.note.toLowerCase()).join(' '),
//         pattern: notes.map(note => DURATIONS[note.duration]).join('')
//       })
  
//       scribble.midi(c, 'bachFull.mid');
//       json["score-partwise"].part.measure.forEach(function(measure){
//         console.log(measure.note[0])
//         console.log(measure.note[1])
//         console.log(measure.note[2])
//         console.log('--------NEXT MEASURE----------')
  
//         measure.note.forEach(function(note) {
//           // console.log(note)
//         })
//       })
//     });
