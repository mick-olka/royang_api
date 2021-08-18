const mongoose = require('mongoose');
const {productRef} = require("../utils");

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    code: {type: String, required: false},
    price: {type: Number, required: true},
    thumbnail: {type: String, required: false},
    features: [{key: {type: String, required: true}, value: {type: String, required: true}}],
    images: [
        {
            _id: mongoose.Schema.Types.ObjectId,
            path: String,
            mainColor: String,
            pillColor: String
        }
    ],
    relatedProducts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Product'}],
    similarProducts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Product'}],
    types: [],
    //otherFeatures: [],
});

module.exports = mongoose.model('Product', productSchema);