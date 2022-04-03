const multer = require('multer');   //

const fs = require('fs');
const {Schema} = require("mongoose");

const checkFileName = (fName) => {
    let fn =fName;
    fn=fn.split(":").join("-");
    while (fs.existsSync("uploads/"+fn)) {
        fn=fn.split(".").join("0.");
    }
    return fn;
}

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
        cb(null, checkFileName(file.originalname));
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

exports.multi_upload = multer({
    storage: this.storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: this.fileFilter,
});


exports.productRef = {
    prodId: {type: Schema.Types.ObjectId, ref: 'Product', required: true}
};

exports.isNumeric=(value)=> {
    return /^\d+$/.test(value);
}

exports.selectArgsMinimized = "_id name code price oldPrice thumbnail url url_name index";
exports.selectArgsExtended = "_id url_name name code price oldPrice thumbnail description keywords features images relatedProducts similarProducts types index";

