const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const Composition = require('./models/Composition');

mongoose.connect('mongodb://localhost/classicalMusic', (err, res) => {
  if (err){console.log('DB CONNECTION FAILED: '+err)}
  else{console.log('DB CONNECTION SUCCESS')}
  scrapeAllMusic()
});


// SCRAPE WIKI
async function scrapeWiki(){
  let res = await axios.get('https://en.wikipedia.org/wiki/List_of_compositions_by_Johann_Sebastian_Bach')
  let $ = cheerio.load(res.data);
  $('#BWV_Chapter_1').siblings().each(function(i){ // Row
    console.log("ROW: = ", i)
    if ( i >= 284 ){
      let newComposition = {
        composer: 'Bach',
      }
      $(this).children().each(function(i, child){ // TD
        if (i === 0) {
          newComposition.opusNo = `BWV${child.children[0].data}`.replace('\n', '')
          console.log(newComposition)
        }
        else if (i === 2) {
          if (child.children[0].data) {
            newComposition.date = child.children[0].data.replace('\n', '');
          } else {newComposition.date = child.children[1].data}
        }
        else if (i === 3) {
          if (child.children[0].children[1].children[0]) {
            newComposition.title = child.children[0].children[0].data + ' ' + child.children[0].children[1].children[0].data;
          } else { console.log(child.children[0].children[1])}
        }
        else if (i === 4) newComposition.key = child.children[0].data.replace('\n', '');
      })
      Composition.create(newComposition)
      console.log(newComposition)
    }
  })
}

// MAYBE USE THE SPOTFIY API

async function scrapeAllMusic(){
  let res = await axios.get('https://www.allmusic.com/artist/johann-sebastian-bach-mn0000075140/compositions')
  let $ = cheerio.load(res.data)
  $('tr').each(function(i){
    if (i > 1){
      let newComposition = {
        composer: 'Bach',
      }
      $(this).children().each(function(i, td){
        let value = td.attribs['data-sort-value']
        if (i === 0 && value) { // YEAR
          // console.log(td.children)
          newComposition.year = value.slice(0, value.indexOf('-')).trim()
        }
        else if (i === 1 && value) { // TITLE
          let opusNo = value.match(/BWV\s\S+\s/ig)
          if (!opusNo) {
            opusNo = value.match(/BWV\s\S+/ig)
          }
          newComposition.title = value.trim();
          if (!opusNo) {
            opusNo = value.match(/BWV\S+\s/ig)
          }
          if (opusNo) {
            newComposition.opusNo = opusNo[0].trim();
          }
        }
        else if (i === 2 && value) { // Genre
          newComposition.genre = value.slice(0, value.indexOf('-')).trim()
        }
        else if (i === 3 && value) { // workType
          newComposition.workType = value.slice(0, value.indexOf('-')).trim()
        }
      })
      console.log(newComposition)
      Composition.create(newComposition)
    }
  })
}