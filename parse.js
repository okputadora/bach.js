const music = require('musicjson');
const scribble = require('scribbletune')
const fs = require('fs');
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
  'quarteer': 'x---',
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
  console.log(files[0])
  fs.readFile(files[0], 'utf8', function (err, res) {
    // console.log(res)
    music.musicJSON(res, function (err, json) {
      // Do something with the MusicJSON data
      if (err) console.log(err)
      console.log(json['score-partwise']['part'][0]['measure'][0].note)
      let testJson = {
        key: '',
        timeSignature: '',
        measures: [
          // note: {
          //   note:
          //   duration: 
          // }
        ]
      
      }
      let notes = []
      // console.log(JSON.stringify(json, null, 2))
      json['score-partwise']['part'][0]['measure'].forEach(function(measure){
        // console.log(measure['$'].number)
        if (measure['$'].number === '1') {
          testJson.key = KEYS[measure.attributes.key.fifths].major
          // console.log(measure)
          testJson.timeSignature = `${measure.attributes.time.beats}/${measure.attributes.time['beat-type']}`
          // console.log(measure.note[0])
          let end = 0;
        }
        // console.log("TEST JSON: ", testJson)
        // console.log(measure)
        if (measure.note.length > 0) {
          measure.note.forEach(function(note, i){
            console.log("NOTE", note)
            if (note.pitch) {
              notes.push({note: `${note.pitch.step}${note.pitch.octave}`, duration: note.type})
            }
          })
        }
      })
      console.log(notes)
    })
  })
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
