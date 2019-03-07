const unzip = require("unzip-stream");
const fs = require("fs");

const destination = "./unzippedChopin";
const source = "./chopinSheetMusic";

function getFiles(directory) {
  return new Promise((resolve, reject) => {
    fs.readdir(directory, function(err, res) {
      if (err) reject(err);
      console.log("success: ", res);
      resolve(res);
    });
  });
}

function batchUnzip(directory, filesArr, destination) {
  return new Promise((resolve, reject) => {
    Promise.all(filesArr.map(file => unzipFile(directory, file, destination)))
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
}

function unzipFile(directory, file, destination) {
  return new Promise((resolve, reject) => {
    console.log(`${directory}/${file}`);
    console.log(`${destination}/${file.replace(".zip", "")}`);
    try {
      let event = fs.createReadStream(`${directory}/${file}`).pipe(
        unzip.Extract({
          path: `${destination}/${file.replace(".zip", "")}`
        })
      );
      event.on("close", err => {
        if (err) {
          console.log("Der was an error");
          reject(err);
        }
        console.log("files unzipped");
        resolve("success");
      });
    } catch (err) {
      console.log("ERROR: skipping, ", err);
      resolve();
    }
  });
}

// getPaths('./unzippedChopinScores')
// .then(res => console.log(res))

function getUnzippedPaths(directory) {
  // unzippedScored
  return new Promise((resolve, reject) => {
    fs.readdir(directory, function(err, res) {
      if (err) reject(err);
      getPath(directory, res, 0, []).then(res2 => {
        console.log("RESOLVED: ", res2);
        resolve({ directory, files: res });
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
          // if ()
        });
      })
    )
      .then(res => {
        resolve(res);
      })
      .catch(err => reject(err));
  });
}

function extractFiles(source, destination) {
  getFiles(source)
    .then(files => batchUnzip(source, files, destination))
    // .then(() => batchParse())
    .then(() => getUnzippedPaths(destination));
}

extractFiles(source, destination);
