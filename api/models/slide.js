const mongoose = require('mongoose');

const slideSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    text: {type: String, required: false},
    lower_text: {type: String, required: false},
    nav_link: {type: String, required: false},
    img: {type: String, required: false},
    index: {type: Number, required: true, default: 0},
});

module.exports = mongoose.model('Slide', slideSchema);