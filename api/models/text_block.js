const mongoose = require('mongoose');

const text_block_schema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true, unique: true},
    text: {type: String, required: false},
    nav_link: {type: String, required: false},
});

module.exports = mongoose.model('Text_block', text_block_schema);