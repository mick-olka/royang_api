const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');   //  needs for fetching form-data

const Product = require('../models/product.js');
const Photo = require('../models/photo.js');
const {deleteFile, upload} = require("../utils");

const link = "http://localhost:5000/";

router.post('/:id', upload.single('path'), (req, res, next) => {
    console.log(req.file);
    const id = req.params.id;
    const img = new Photo({
        _id: new mongoose.Types.ObjectId(),
        path: link + req.file.path,
        mainColor: req.body.mainColor,
        pillColor: req.body.pillColor,
    });
    Product.findByIdAndUpdate({_id: id}, {$push: {images: img}}, {safe: true, upsert: false})
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json(
                    {
                        message: "PUSHED PHOTO",
                        url: link + req.file.path,
                        code: 0
                    });
            } else res.status(404).json({error: "Not_Found", code: 1});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, code: 1});
        });
});

router.delete('/:id/:fileName/', (req, res, next) => {
    const id = req.params.id;
    const fN = req.params.fileName;
    Product.updateOne({_id: id}, {$pull: {images: {path: link + 'uploads/' + fN}}}, {multi: true})
        .exec()
        .then(doc => {
            if (doc) {
                deleteFile(fN);
                res.status(200).json(
                    {
                        message: "DELETED PHOTO",
                        code: 0
                    });
            } else res.status(404).json({error: "Not_Found", code: 1});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, code: 1});
        });
});

router.post('/thumbnail/:id', upload.single('thumbnail'), (req, res, next) => {
    const id = req.params.id;

    const findAndUpdate = () => {
        Product.findOneAndUpdate({_id: id}, {$set: {thumbnail: link+req.file.path}}, {returnOriginal: false},)
            .exec()
            .then(doc => {
                res.status(200).json({
                    message: "THUMBNAIL UPDATED",
                    url: link + "products/" + id,
                    req: req.body,
                    file: link+req.file.path,
                    code: 0
                });
            })
            .catch(err => {
                res.status(500).json({error: err, code: 1});
            });
    }

    Product.findById(id)
        .select("_id thumbnail")
        .exec()
        .then(doc => {
            if (doc) {
                findAndUpdate();//  call update
                if (req.file) deleteFile(doc.thumbnail.split('/').pop());//  del thumb
            } else res.status(404).json({error: "Not_Found", code: 1});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, code: 1});
        });

});

module.exports = router;