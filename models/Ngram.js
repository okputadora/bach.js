const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId;
const ngram = new mongoose.Schema({
  artist: {type: String},
  nGrams: {type: Object},
})

const nGram = mongoose.model('Ngram', ngram)
module.exports = nGram;