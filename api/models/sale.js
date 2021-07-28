const mongoose = require('mongoose');

const saleSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: false },
    info: { type: String, required: false },
    oldPrice: { type: Number, required: false },
    newPrice: { type: Number, required: false },
    endDate: { type: String, required: false },
    images: [
        {_id: mongoose.Schema.Types.ObjectId,
            filename: String,
            path: String,
            mainColor: String,
            pillColor: String
        }
    ],
    preview: { type: String, required: false },
});

module.exports = mongoose.model('Sale', saleSchema);