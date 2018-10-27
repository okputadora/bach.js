const mongoose = require('mongoose')

const composition = new mongoose.Schema({
  word: {type: String, required: true},
  POS: {type: String},
  text: {type: String},
  keywords: {type: Array},
  relatedWords: {type: Array},
  sheetMusicIds: [{type: String}]
})

const Composition = mongoose.model('Composition', composition)
module.exports = Composition;