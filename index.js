const music = require('musicjson');
const scribble = require('scribbletune')
// const xml = require('./preuldePiano.xml')
const fs = require('fs')


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
fs.readFile('./preuldePiano.xml', 'utf8', function (err, res) {
  // console.log(res)
  music.musicJSON(res, function (err, json) {
    
    // Do something with the MusicJSON data
    if (err) console.log(err)
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
    json['score-partwise']['part']['measure'].forEach(function(measure){
      // console.log(measure['$'].number)
      if (measure['$'].number === '1') {
        testJson.key = KEYS[measure.attributes.key.fifths].major
        // console.log(measure)
        testJson.timeSignature = `${measure.attributes.time.beats}/${measure.attributes.time['beat-type']}`
        // console.log(measure.note[0])
        let end = 0;
      }
      measure.note.forEach(function(note, i){
        if (note.staff === '1' && note.pitch) {
          notes.push({note: `${note.pitch.step}${note.pitch.octave}`, duration: note.type})
        }
      })
      
    })
    // console.log(notes)
    c = scribble.clip({
      notes: notes.map(note => note.note.toLowerCase()).join(' '),
      pattern: notes.map(note => DURATIONS[note.duration]).join('')
    })

    scribble.midi(c, 'bachFull.mid');
    // json["score-partwise"].part.measure.forEach(function(measure){
    //   console.log(measure.note[0])
    //   console.log(measure.note[1])
    //   console.log(measure.note[2])
    //   console.log('--------NEXT MEASURE----------')

    //   measure.note.forEach(function(note) {
    //     // console.log(note)
    //   })
    // })
  });
})



// {
//   'score-partwise':
//   {
//     work: { 'work-title': 'prelude piano', '%': 1 },
//     identification:
//     {
//       encoding: [Object],
//         source: 'http://musescore.com/score/2184946',
//           '%': 2
//     },
//     defaults:
//     {
//       scaling: [Object],
//         'page-layout': [Object],
//           'word-font': [Object],
//             'lyric-font': [Object],
//               '%': 3
//     },
//     credit: [[Object], [Object]],
//     'part-list': { 'score-part': [Object], '%': 6 },
//     part: { '$': [Object], measure: [Array], '%': 7 }
//   }
// }