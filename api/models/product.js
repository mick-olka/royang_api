const mongoose = require('mongoose');
const {productRef} = require("../utils");

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    code: {type: String, required: false},
    price: {type: Number, required: true},
    thumbnail: {type: String, required: false},
    figures: {
        height: {type: Number, required: false},
        width: {type: Number, required: false},
        depth: {type: Number, required: false},
        weight: {type: Number, required: false},
    },
    images: [
        {
            _id: mongoose.Schema.Types.ObjectId,
            path: String,
            mainColor: String,
            pillColor: String
        }
    ],
    relatedProducts: [{productRef}],
    similarProducts: [{productRef}],
    otherFeatures: [],
});

module.exports = mongoose.model('Product', productSchema);