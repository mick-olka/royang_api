const mongoose = require('mongoose');
const {productRef} = require("../utils");

const listSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    items: [{productRef}],
    url: {type: String, required: true, unique: true},
});

module.exports = mongoose.model('List', listSchema);