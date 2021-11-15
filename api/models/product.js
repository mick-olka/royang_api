const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    code: {type: String, required: false},
    price: {type: Number, required: true},
    oldPrice: {type: Number, required: false},
    thumbnail: {type: String, required: false},
    features: [{key: {type: String, required: true}, value: {type: String, required: true}}],
    images: [
        {
            _id: mongoose.Schema.Types.ObjectId,
            //path: String,
            pathArr: [String],
            mainColor: String,
            pillColor: String
        }
    ],
    relatedProducts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Product'}],
    similarProducts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Product'}],
    types: [],
    //otherFeatures: [],
    index: {type: Number, required: false},
});

module.exports = mongoose.model('Product', productSchema);