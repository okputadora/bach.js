

//@TODO GRAB RELATED ENTRIES

const axios = require('axios');
const cheerio = require('cheerio');
const Composition = require('./models/Composition')
const mongoose = require('mongoose');

const fs = require('fs');
const Path = require('path');
let scoreIds = [];
let counter = 1;
let scores = []
// getIds('')
mongoose.connect('mongodb://localhost/classicalMusic', (err, res) => {
  if (err){console.log('DB CONNECTION FAILED: '+err)}
  else{console.log('DB CONNECTION SUCCESS')}
  scrapeIds('');
});

function scrapeIds(page) {
  let url = `https://musescore.com/sheetmusic/artists/bach${page}`
  console.log(url)
  axios.get(url)
  .then(res => {
    let $ = cheerio.load(res.data);
    $(".node--type-score").each(function(i, el){
      el.children.forEach(function(child){
        // console.log(child)
        // console.log(child.attribs)
        if (child.name === 'h2') {
          let comp = {}
          comp.title = child.children[1].children[0].data.trim()
          let idArr = child.children[1].attribs.href.split("/")
          comp.id = idArr[idArr.length - 1]
          let opusNo = comp.title.match(/BWV\s[0-9]+/ig)
          if (opusNo) {
            comp.opusNo = opusNo[0].trim()
            scores.push(comp)
            console.log(comp)
          }
        }
      })
    })
    counter++;
    if (counter < 101) {
      console.log('getting page ', counter)
      scrapeIds(`?page=${counter}`)
    } else {
      console.log('done without error')
      downloadFromIds(0)
      .then(res => console.log('file downloaded'))
      .catch(err => console.log('ERROR donwloading file: ', err))
    }
  })
  .catch(err => {
    console.log('error')
    // downloadFromIds()
  })
}

downloadIndex = 0;

async function downloadFromIds(index){
  console.log('downloading score!')
  // let unique = scores.filter((v, i, a) => a.indexOf(v) === i); 
  // let path = Path.resolve(__dirname, 'scores', `${id}.zip`)
  // console.log(typeof url)
  // console.log("URL: ", url)
  let response;
  let score = scores[index];
  console.log(score.opusNo)
  if (score.opusNo){
    let comp = await Composition.findOneAndUpdate({opusNo: score.opusNo}, {$addToSet: {sheetMusicIds: score.id}}, {new: true})
    console.log(comp)
  }
  if (index < scores.length) [
    downloadFromIds(index + 1)
  ]
  // let url = `https://musescore.com/score/${score.id}/download/mxl`;
  // try {
  //   response = await axios({
  //     method: 'GET',
  //     url: url,
  //     responseType: 'stream',
  //     headers: {
  //       "authority": "s3.musescore.com",
  //       "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
  //       "accept-encoding": "gzip, deflate, br",
  //       "cookie": "mu_browser_uni=bkKUxA5O; _ga=GA1.2.615981828.1540399148; _gid=GA1.2.555024661.1540399148; _ym_uid=1540399148619525346; _ym_d=1540399148; _ug_pUserHash=c8f5db1e-ecb2-44f8-9ca7-f63871f09a8f.1540423700; _ym_isad=1; _ym_visorc_46196364=w",
  //       "referer": "https://musescore.com/hmscomp/scores/267781"
  //     }
  //   })
  //   // console.log(response.data)
  //   // response.data.pipe(fs.createWriteStream(path))
  //   // return new Promise((resolve, reject) => {
  //   //   response.data.on('end', () => resolve())
  //   //   response.data.on('error', (err) => reject(err))
  //   // })
  // }
  // catch(err) {
  //   console.log("ERROR: ", err)
  // }
}