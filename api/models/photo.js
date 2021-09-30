const mongoose = require('mongoose');

const photoSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    pathArr: [{ type: String, required: true }],
    mainColor: { type: String, required: true },
    pillColor: { type: String, required: true },
});

module.exports = mongoose.model('Photo', photoSchema);