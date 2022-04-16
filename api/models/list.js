const mongoose = require('mongoose');

const listSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {ua: {type: String, required: true}, ru: {type: String, required: true}},
    items: [{type: mongoose.Schema.Types.ObjectId, ref: 'Product'}],
    url: {type: String, required: true, unique: true},
    index: {type: Number, required: true, default: 0},
    description: {type: String, required: false},
    keywords: [{type: String}]
});

module.exports = mongoose.model('List', listSchema);