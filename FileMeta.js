const mongoose = require('mongoose');


const fileMetaSchema = new mongoose.Schema({
originalName: { type: String, required: true },
filename: { type: String, required: true },
mimeType: { type: String },
size: { type: Number },
uploadDate: { type: Date, default: Date.now }
});


module.exports = mongoose.model('FileMeta', fileMetaSchema);