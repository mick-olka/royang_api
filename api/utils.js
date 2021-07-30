const multer = require('multer');   //

const fs = require('fs');
const {Schema} = require("mongoose");

exports.deleteFile = (fName) => {
    if (fs.existsSync("uploads/"+fName)) {
        fs.unlinkSync("uploads/"+fName)
        console.log('file deleted');
    } else console.log('file not exists');
};

exports.storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

exports.fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image.png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

exports.upload = multer({
    storage: this.storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: this.fileFilter
});

exports.productRef = {
    prodId: {type: Schema.Types.ObjectId, ref: 'Product', required: true}
};

