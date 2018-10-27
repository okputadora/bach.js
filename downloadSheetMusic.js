
const axios = require('axios');
const cheerio = require('cheerio');
const Composition = require('./models/Composition');
const SheetMusic = require('./models/SheetMusic');
const mongoose = require('mongoose');

const fs = require('fs');
const Path = require('path');
let compositions = [];
mongoose.connect('mongodb://localhost/classicalMusic', async (err, res) => {
  if (err){console.log('DB CONNECTION FAILED: '+err)}
  else{console.log('DB CONNECTION SUCCESS')}
  compositions = await Composition.find({sheetMusicIds: {$exists: true}})
  downloadSheetMusic(0)
});

async function downloadSheetMusic(index) {
  let id = compositions[index].sheetMusicIds[0]
  let url = `https://musescore.com/score/${id}/download/mxl`;

  try {
    response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      headers: {
        // "authority": "musescore.com",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "cookie": "mu_browser_uni=bkKUxA5O; _csrf=haFS1zkRMlsqvS-vZVXW5PIIDYKsh5wM; _ga=GA1.2.615981828.1540399148; _ym_uid=1540399148619525346; _ym_d=1540399148; mu_user=15481535653336574050; _ug_pUserHash=c8f5db1e-ecb2-44f8-9ca7-f63871f09a8f.1540423700; _gid=GA1.2.1415737393.1540568299; _ym_isad=1; mscom=c0763309ee2d73153575d47b878d5c22; _ym_visorc_46196364=w",
        "pragma": "no-cache",
        "referer": "https://musescore.com/nicolas/scores/4363",
        "upgrade-insecure-requests": "1"
      }
      // headers: {
      //   "authority": "s3.musescore.com",
      //   "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      //   "accept-encoding": "gzip, deflate, br",
      //   "cookie": "mu_browser_uni=bkKUxA5O; _ga=GA1.2.615981828.1540399148; _gid=GA1.2.555024661.1540399148; _ym_uid=1540399148619525346; _ym_d=1540399148; _ug_pUserHash=c8f5db1e-ecb2-44f8-9ca7-f63871f09a8f.1540423700; _ym_isad=1; _ym_visorc_46196364=w",
      //   "referer": "https://musescore.com/hmscomp/scores/267781"
      // }
    })
    let path = Path.resolve(__dirname, 'sheetMusic', `${id}.zip`)
    response.data.pipe(fs.createWriteStream(path))
    response.data.on('end', async () => {
      await SheetMusic.create({composition: compositions[index]._id, filePath: `sheetMusic/${id}.zip`})
      if (index < compositions.length){
        downloadSheetMusic(index + 1)
      } else {
        console.log('success')
      }
    })
    response.data.on('error', (err) => reject(err))
  }
  catch(err) {
    console.log("ERROR: ", err)
  }
}

