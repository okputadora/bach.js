const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId;
const sheetMusic = new mongoose.Schema({
  filePath: {type: String},
  composition: {type: ObjectId, ref: 'Composition'}
})

const SheetMusic = mongoose.model('SheetMusic', sheetMusic)
module.exports = SheetMusic;