//@TODO GRAB RELATED ENTRIES

const axios = require("axios");
const cheerio = require("cheerio");
const Composition = require("./models/Composition");
const mongoose = require("mongoose");

let counter = 1;
let scores = [];
let artist = "chopin";
// getIds('')
mongoose.connect("mongodb://localhost/classicalMusic", (err, res) => {
  if (err) {
    console.log("DB CONNECTION FAILED: " + err);
  } else {
    console.log("DB CONNECTION SUCCESS");
  }
  scrapeIds("");
});

function scrapeIds(page) {
  let url = `https://musescore.com/sheetmusic/artists/${artist}${page}`;
  axios
    .get(url)
    .then(res => {
      let $ = cheerio.load(res.data);
      $(".node--type-score").each(function(i, el) {
        el.children.forEach(function(child) {
          // console.log(child)
          // console.log(child.attribs)
          if (child.name === "h2") {
            let comp = {};
            comp.title = child.children[1].children[0].data.trim();
            let idArr = child.children[1].attribs.href.split("/");
            comp.id = idArr[idArr.length - 1];
            // let opusNo = comp.title.match(/BWV\s[0-9]+/gi);
            // if (opusNo) {
            //   comp.opusNo = opusNo[0].trim();
            scores.push(comp);
            // }
          }
        });
      });
      console.log(counter);
      counter++;
      if (counter < 101) {
        scrapeIds(`?page=${counter}`);
      } else {
        addIdsToComposition(0)
          .then(res => console.log("file downloaded"))
          .catch(err => console.log("ERROR donwloading file: ", err));
      }
    })
    .catch(err => {
      console.log("error");
      addIdsToComposition(0)
        .then(res => console.log("file downloaded"))
        .catch(err => console.log("ERROR donwloading file: ", err));
      // downloadFromIds()
    });
}

downloadIndex = 0;

async function addIdsToComposition(index) {
  let response;
  let score = scores[index];
  console.log(score);
  try {
    await Composition.create({
      composer: "chopin",
      title: score.title,
      sheetMusicIds: [score.id]
    });
  } catch (err) {
    console.log(err);
    return addIdsToComposition(index + 1);
  }
  if (index < scores.length) {
    addIdsToComposition(index + 1);
  }
}
