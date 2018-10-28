const unzip = require('unzip');
const fs = require('fs')

function getFiles(directory){
  return new Promise ((resolve, reject) => {
    fs.readdir(directory, function(err, res){
      if (err) reject(err)
      resolve({directory, files: res,})
    })
  })
}

function batchUnzip(directory, filesArr, destination){
  return new Promise((resolve, reject) => {
    Promise.all(filesArr.map((file) => unzipFile(directory, file, destination)))
    .then(res => resolve(res))
    .catch(err => reject(err))
  })
}

function unzipFile(directory, file, destination) {
  return new Promise((resolve, reject) => {
    let event = fs.createReadStream(`${directory}/${file}`)
      .pipe(unzip.Extract({
        path: `${destination}/${file.replace('.zip' , '')}`
      }))
    event.on('close', (err) => {
      if (err) reject(err)
      resolve('success')
    })
  })
}

getPaths('./unzippedScores')
// .then(res => console.log(res))

function getUnzippedPaths(directory) { // unzippedScored
  return new Promise ((resolve, reject) => {
    fs.readdir(directory, function(err, res){
      if (err) reject(err)
      getPath(directory, res, 0, [])
      .then(res2 => {
        console.log("RESOLVED: ", res2)
        resolve({directory, files: res,})
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
      // if ()
      })
    }))
    .then(res => {
      resolve(res)
    })
    .catch(err => reject(err))
  })
}

module.exports = function extractFiles (source, destination) {
  getFiles(source)
  .then((res) => batchUnzip(res.directory, res.files, destination))
  .then(() => batchParse())
  .then(() => getUnzippedPaths(destination))
}
