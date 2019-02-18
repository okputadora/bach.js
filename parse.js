const music = require("musicjson");
const fs = require("fs");
const distance = require("tonal-distance");
const Ngram = require("./Models/Ngram");
const mongoose = require("mongoose");
const KEYS = {
  "0": { major: "C", minor: "A" },
  "1": { major: "G", minor: "E" },
  "2": { major: "D", minor: "B" },
  "3": { major: "A", minor: "F#" },
  "4": { major: "E", minor: "C#" },
  "5": { major: "B", minor: "G#" },
  "6": { major: "F#", minor: "D#" },
  "-1": { major: "F", minor: "D" },
  "-2": { major: "BFLAT", minor: "G" },
  "-3": { major: "EFLAT", minor: "C" },
  "-4": { major: "AFLAT", minor: "F" },
  "-5": { major: "DFLAT", minor: "BFLAT" },
  "-6": { major: "GFLAT", minor: "EFLAT" }
};

mongoose.connect("mongodb://localhost/classicalMusic", async (err, res) => {
  if (err) {
    console.log("DB CONNECTION FAILED: " + err);
  } else {
    console.log("DB CONNECTION SUCCESS");
  }
  getPaths("./unzippedScores")
    .then(files => batchParse(files))
    .then(parsedSongs => {
      console.log("songs are parsed, we parsed ", parsedSongs.length);
      // console.log(parsedSongs[3])
      getNgramsFromSongs(parsedSongs, 4, 0);
    }); // 4 = ngram size 0 = index to start from of parsedSongs
});

// .then(res => console.log(res))

//  ITHINK THIS CAN BE COMBINED WITH GETPATH
function getPaths(directory) {
  // unzippedScored
  return new Promise((resolve, reject) => {
    fs.readdir(directory, function(err, res) {
      if (err) reject(err);
      getPath(directory, res, 0, []).then(res2 => {
        // console.log("RESOLVED: ", res2)
        resolve(res2);
      });
    });
  });
}

function getPath(directory, srcPaths, index, paths) {
  return new Promise((resolve, reject) => {
    Promise.all(
      srcPaths.map(path => {
        return new Promise((resolve, reject) => {
          fs.readdir(`${directory}/${path}`, function(err, res) {
            if (err) reject(err);
            let file = res.filter(f => f.includes(".xml"))[0];
            resolve(`${directory}/${path}/${file}`);
          });
        });
      })
    )
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
}

function batchParse(files) {
  return new Promise((resolve, reject) => {
    Promise.all(
      files.map((file, i) => {
        return new Promise((resolve, reject) => {
          fs.readFile(file, "utf8", function(err, res) {
            // console.log(res)
            music.musicJSON(res, function(err, json) {
              // Do something with the MusicJSON data
              if (err) console.log(err);
              // console.log(json["score-partwise"]["part"][0]["measure"][0]);
              // console.log(json);
              // console.log(json["score-partwise"]["part"][0]["measure"][5].note);
              try {
                let musicJson = {
                  key: "",
                  timeSignature: "",
                  notes: []
                };
                json["score-partwise"]["part"][0]["measure"].forEach(function(
                  measure,
                  x
                ) {
                  if (i === 1 && x === 0) console.log("MEASRE: ", measure);
                  // console.log(measure['$'].number)
                  if (
                    measure["$"].number === "1" &&
                    measure.attributes &&
                    measure.attributes.key.fifths
                  ) {
                    musicJson.key = KEYS[measure.attributes.key.fifths].major; // NEED TO DECIDE IF ITS MINOR OR MAJOR
                    console.log("KEY: ", musicJson);
                    // console.log(measure)
                    musicJson.timeSignature = `${
                      measure.attributes.time.beats
                    }/${measure.attributes.time["beat-type"]}`;
                    // console.log(measure.note[0])
                    let end = 0;
                  }
                  // console.log("TEST JSON: ", testJson)
                  // console.log(measure)
                  if (measure.note.length > 0) {
                    measure.note.forEach(function(note, x) {
                      // console.log("NOTE", note);
                      if (note.pitch) {
                        let noteName;
                        let { step, octave, alter } = note.pitch;
                        if (alter === "-1") {
                          noteName = step + "b" + octave;
                        } else if (alter === "1") {
                          noteName = step + "#" + octave;
                        } else noteName = step + octave;
                        musicJson.notes.push({
                          noteName,
                          duration: note.type
                        });
                      }
                    });
                  }
                });
                if (!musicJson.key) {
                  resolve(null);
                } else {
                  console.log("successfully parsed ", i);
                  resolve(getIntervals(musicJson));
                }
              } catch (err) {
                // console.log("ERROR: ",err);
                resolve(null);
              }
              // console.log(musicJson)
              // console.log(notes)
            });
          });
        });
      })
    )
      .then(parsedSongs => {
        // console.log("success")
        // console.log(parsedSongs)
        return resolve(parsedSongs.filter(song => song != null && song.key));
      })
      .catch(err => console.log("ERORR: ", err));
  });
}

function getIntervals(musicJson) {
  tonalKey = musicJson.key.replace("FLAT", "b");
  musicJson.notes.forEach((note, i, arr) => {
    noteName = note.noteName.replace("FLAT", "b");
    // console.log(i)
    note.relativeNote = distance.interval(`${tonalKey}4`, noteName); // THIS 4 SHOULD NOT BE HARDCODED WE NEED TO DEDUCE IT FROM music.Json.key
    note.distanceFromPrev =
      i > 0 ? distance.semitones(arr[i - 1].noteName, noteName) : null;
  });
  return musicJson;
  // console.log(musicJson)
}

async function getNgramsFromSongs(songs, nGramSize, index) {
  if (index === 0) {
    console.log(songs.map(song => song.key));
  }
  // console.log('current song: ', index)
  let existingGrams = await Ngram.findOne({ artist: "Bach" });
  let nGramData = {};
  let song = songs[index];
  if (song == null) {
    index += 1;
    return getNgramsFromSongs(songs, nGramSize, index);
  }
  song.notes.forEach((note, i, arr) => {
    let target = "";
    let nextChunk = "";
    if (i + nGramSize * 2 > arr.length) return;
    // Get four note chunk
    for (let x = 0; x < nGramSize; x++) {
      target += `${arr[i + x].relativeNote}@${arr[i + x].duration}&`;
      nextChunk += `${arr[i + x + nGramSize].relativeNote}@${
        arr[i + x + nGramSize].duration
      }&`;
    }
    // Check if this four note chunk exists in the db
    // THIS NEEDS TO BE REFACTORED ITS WEIRD WE HAVE BOTH nGramData and existingNGrams
    if (existingGrams) {
      if (existingGrams.nGrams[target]) {
        if (existingGrams.nGrams[target][nextChunk]) {
          existingGrams.nGrams[target][nextChunk] += 1;
        } else existingGrams.nGrams[target][nextChunk] = 1;
      } else {
        existingGrams.nGrams[target] = { [nextChunk]: 1 };
      }
    } else if (nGramData[target]) {
      if (nGramData[target][nextChunk]) {
        nGramData[target][nextChunk] += 1;
      } else nGramData[target][nextChunk] = 1;
    } else nGramData[target] = { [nextChunk]: 1 };
  });
  // console.log('successfully built n grams ')
  index += 1;
  // console.log(nGramData);
  if (!existingGrams) {
    // await existingGrams.save()
    console.log("NEW to db");
    Ngram.create({ artist: "Bach", nGrams: nGramData }).then(res => {
      getNgramsFromSongs(songs, nGramSize, index);
    });
  } else {
    await existingGrams.save();
    if (index < songs.length) {
      console.log("analyzing song no: ", index);
      getNgramsFromSongs(songs, nGramSize, index);
    } else done();
  }
}
// THIS NEEDS TO BE REFACTORED
function done() {
  console.log("success!");
  mongoose.connection.close();
}
