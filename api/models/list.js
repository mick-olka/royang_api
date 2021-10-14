const mongoose = require('mongoose');
const {productRef} = require("../utils/utils");

const listSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    items: [{type: mongoose.Schema.Types.ObjectId, ref: 'Product', unique: false}],
    url: {type: String, required: true, unique: true},
});

module.exports = mongoose.model('List', listSchema);