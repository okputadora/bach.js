const axios = require("axios");
const cheerio = require("cheerio");
const Composition = require("./models/Composition");
const SheetMusic = require("./models/SheetMusic");
const mongoose = require("mongoose");

const fs = require("fs");
const Path = require("path");
let compositions = [];
mongoose.connect("mongodb://localhost/classicalMusic", async (err, res) => {
  if (err) {
    console.log("DB CONNECTION FAILED: " + err);
  } else {
    console.log("DB CONNECTION SUCCESS");
  }
  compositions = await Composition.find({ composer: "chopin" });
  downloadSheetMusic(0);
});

async function downloadSheetMusic(index) {
  let id = compositions[index].sheetMusicIds[0];
  let url = `https://musescore.com/score/${id}/download/mxl`;
  console.log("downloading");
  try {
    response = await axios({
      method: "GET",
      url: url,
      responseType: "stream",
      headers: {
        // "authority": "musescore.com",
        scheme: "https",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        cookie:
          "mu_browser_uni=6AFyQGUI; _ga=GA1.2.242134240.1542825677; _ym_uid=1542825677125432168; _ym_d=1542825677; _ug_pUserHash=ff9edbd6-3084-4680-96bb-acf66a4e756d.1543698523; _csrf=wsRhCffUxGN2hqoyXm7n0hnjiLB5T88Q; __gads=ID=452032d0cce1ceac:T=1547583664:S=ALNI_MZGLXoXaprzwNo5lt-jW8xwVMSIfg; mscom=bdfea88e198ad0072cb19adfa63c8c34; mu_user_new=15789631304885325954; _gid=GA1.2.2139106463.1550525781; _ym_isad=1; _pro_abVar=2019_02_18_PRO_ABCD.C; mscom_new=6f916aee9ecf69ecd1a60635533802ad",
        pragma: "no-cache",
        "upgrade-insecure-requests": 1
      }
      // headers: {
      //   "authority": "s3.musescore.com",
      //   "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      //   "accept-encoding": "gzip, deflate, br",
      //   "cookie": "mu_browser_uni=bkKUxA5O; _ga=GA1.2.615981828.1540399148; _gid=GA1.2.555024661.1540399148; _ym_uid=1540399148619525346; _ym_d=1540399148; _ug_pUserHash=c8f5db1e-ecb2-44f8-9ca7-f63871f09a8f.1540423700; _ym_isad=1; _ym_visorc_46196364=w",
      //   "referer": "https://musescore.com/hmscomp/scores/267781"
      // }
    });
    let path = Path.resolve(__dirname, "chopinSheetMusic", `${id}.zip`);
    response.data.pipe(fs.createWriteStream(path));
    response.data.on("end", async () => {
      await SheetMusic.create({
        composition: compositions[index]._id,
        filePath: `sheetMusic/${id}.zip`
      });
      if (index < compositions.length) {
        downloadSheetMusic(index + 1);
      } else {
        console.log("success");
      }
    });
    response.data.on("error", err => reject(err));
  } catch (err) {
    console.log("ERROR: ", err);
  }
}
