const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    phone: {type: String, required: true},
    message: {type: String, required: false},
    cart: [{
        product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
        mainColor:{type: String, required: false},
        pillColor:{type: String, required: false},
        count: {type: Number, required: true},
        photo: {type: String, required: false}
    }],
    sum: {type: Number, required: true},
    status: {type: String, required: true}, //  waiting - processing - canceled - done
    date: {type: Date, required: true},
});

module.exports = mongoose.model('Order', orderSchema);