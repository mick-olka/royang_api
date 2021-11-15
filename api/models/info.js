const mongoose = require('mongoose');

const infoSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    url: {type: String, required: true},
    header: {type: String, required: false},
    data: {type: Object, required: false},
    index: {type: Number, required: true, default: 0},
});

module.exports = mongoose.model('Info', infoSchema);