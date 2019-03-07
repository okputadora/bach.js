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

const DURATIONS = {
  "32nd": "32",
  "16th": "16",
  eighth: "8",
  quarter: "4",
  half: "2",
  whole: "1"
};

let score = {
  1: "|", // treble
  2: "|" // bass
};
// let trebleString = "|";
// let bassString = "|";

mongoose.connect("mongodb://localhost/classicalMusicTEST", async (err, res) => {
  if (err) {
    console.log("DB CONNECTION FAILED: " + err);
  } else {
    console.log("DB CONNECTION SUCCESS");
  }
  batchParse(["./chopinSheetMusic/2147516/lg-175543094.xml"]);
  // getPaths("./a-unzippedChopin")
  //   .then(files => batchParse(files))
  //   .then(parsedSongs => {
  //     console.log("songs are parsed, we parsed ", parsedSongs.length);
  //     // console.log(parsedSongs[3])
  //     getNgramsFromSongs(parsedSongs, 4, 0);
  //   }); // 4 = ngram size 0 = index to start from of parsedSongs
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
  // console.log("here we are: ", files);
  return new Promise((resolve, reject) => {
    Promise.all(
      files.map((file, i) => {
        return new Promise((resolve, reject) => {
          // console.log(file);
          fs.readFile(file, "utf8", function(err, res) {
            // console.log(res);
            music.musicJSON(res, function(err, json) {
              // console.log(json);
              // Do something with the MusicJSON data
              if (err) console.log(err);
              // console.log(json["score-partwise"]["part"][0]["measure"][0]);
              // console.log(json);
              // console.log(json["score-partwise"]["part"][0]["measure"][5].note);
              // console.log(json["score-partwise"]["part"]);
              try {
                let musicJson = {
                  key: "",
                  timeSignature: "",
                  notes: []
                };
                // console.log(json["score-partwise"]["part"]);
                json["score-partwise"]["part"]["measure"].forEach(function(
                  measure,
                  x
                ) {
                  if (measure.note.length > 0) {
                    // console.log(measure);

                    measure.note.forEach((note, i) => {
                      let { pitch, staff, rest, type, dot } = note;
                      let noteName;
                      if (pitch) {
                        let { step, octave, alter } = pitch;
                        // console.log(step, octave, alter);
                        if (alter === "-1") {
                          noteName = step + "b" + octave;
                        } else if (alter === "1") {
                          noteName = step + "#" + octave;
                        } else noteName = step + octave;

                        // musicJson.notes.push({
                        //   noteName,
                        // console.log(note.staff);
                        // console.log(note.type);
                        // console.log(noteName);
                      } else if (rest) {
                        // its a rest
                        noteName = "R";
                      }
                      score[staff] += `${noteName}@${DURATIONS[type]}`;
                      if (dot) score[staff] += "DOT";
                      if (
                        i === measure.note.length - 1 ||
                        !measure.note[i + 1].chord ||
                        measure.note[i].staff !== measure.note[i + 1].staff
                      ) {
                        score[staff] += "|";
                      }
                    });
                  }
                });
                console.log(score);
                // }
              } catch (err) {
                // console.log("ERROR: ",err);
                resolve(null);
              }
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
  let existingGrams = await Ngram.findOne({ artist: "Chopin" });
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
    // RELATIVE NOTE
    // for (let x = 0; x < nGramSize; x++) {
    //   target += `${arr[i + x].relativeNote}@${arr[i + x].duration}&`;
    //   nextChunk += `${arr[i + x + nGramSize].relativeNote}@${
    //     arr[i + x + nGramSize].duration
    //   }&`;
    // }
    //ABSOLUTE NOTE
    for (let x = 0; x < nGramSize; x++) {
      target += `${arr[i + x].noteName}@${arr[i + x].duration}&`;
      nextChunk += `${arr[i + x + nGramSize].noteName}@${
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
    Ngram.create({ artist: "Chopin", nGrams: nGramData }).then(res => {
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

function parseSong(part) {
  part.reduce((acc, cur, idx, src) => {
    // close up the last note's position if no more notes are joined to it
    if (!cur.chord) {
      acc += "|";
    }
    acc += cur.pitch + "@" + cur.type;
  }, "");
}
