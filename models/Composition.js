const mongoose = require('mongoose')

const composition = new mongoose.Schema({
  composer: {type: String},
  title: {type: String},
  opusNo: {type: String},
  date: {type: String},
  workType: {type: String},
  genre: {type: String},
  sheetMusicIds: [{type: String}]
})

const Composition = mongoose.model('Composition', composition)
module.exports = Composition;