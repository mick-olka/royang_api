const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');   //  needs for fetching form-data

const Product = require('../models/product.js');
const Photo = require('../models/photo.js');
const {deleteFile, upload} = require("../utils");

const link = "http://localhost:5000/";

router.post('/:id', upload.single('path'), (req, res, next) => {
    console.log(req);
    const id = req.params.id;
    const img = new Photo({
        _id: new mongoose.Types.ObjectId(),
        path:  link + req.file.path,
        mainColor: req.body.mainColor,
        pillColor: req.body.pillColor
    });
    Product.findByIdAndUpdate({_id: id}, { $push: {images: img} }, {safe: true, upsert: false})
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json(
                    {
                        message: "PUSHED PHOTO",
                        url: link + req.file.path,
                    });
            } else res.status(404).json({error: "Not_Found"});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

router.delete('/:id/:fileName/', (req, res, next) => {
    const id = req.params.id;
    const fN = req.params.fileName;
    Product.updateOne({_id: id}, { $pull: {images: { path: link+'uploads/'+fN } } }, {multi: true})
        .exec()
        .then(doc => {
            if (doc) {
                deleteFile(fN);
                res.status(200).json(
                    {
                        message: "DELETED PHOTO",
                    });
            } else res.status(404).json({error: "Not_Found"});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

module.exports = router;