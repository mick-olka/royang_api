const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    url_name: {type: String, required: true, unique: true},
    name: {ua:{type: String, required: true, unique: true}, ru: {type: String, required: true, unique: true}},
    code: {type: String, required: false},
    price: {type: Number, required: true},
    oldPrice: {type: Number, required: false},
    thumbnail: {type: String, required: false},
    description: {ua:{type: String, required: false}, ru:{type: String, required: false}},
    features: {
        ua:[{key: {type: String, required: true}, value: {type: String, required: true}}],
        ru:[{key: {type: String, required: true}, value: {type: String, required: true}}]},
    images: [
        {
            _id: mongoose.Schema.Types.ObjectId,
            pathArr: [String],
            mainColor: {ua: String, ru: String},
            pillColor: {ua: String, ru: String}
        }
    ],
    relatedProducts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Product', unique: true}],
    similarProducts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Product', unique: true}],
    types: [],
    index: {type: Number, required: false},
});

module.exports = mongoose.model('Product', productSchema);