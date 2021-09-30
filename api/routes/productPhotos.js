const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');   //  needs for fetching form-data

const checkAuth = require('../middleware/check-auth');
const Product = require('../models/product.js');
const Photo = require('../models/photo.js');
const {deleteFile, upload, multi_upload} = require("../utils/utils");

const link = process.env.BASE_LINK;

router.post('/:id', multi_upload.array('pathArr', 20), (req, res, next) => {
    console.log(req.files);
    // res.status(200).json(
    //     {
    //         message: "PUSHED PHOTOS",
    //         // pathArr: req.files.map(p=>{return link+p}),
    //         files: req.files,
    //         code: 0
    //     });
    const id = req.params.id;
    let pathArr = req.files.map(f=>{return f.path});
    const img = new Photo({
        _id: new mongoose.Types.ObjectId(),
        pathArr: pathArr,
        mainColor: req.body.mainColor,
        pillColor: req.body.pillColor,
    });
    Product.findByIdAndUpdate({_id: id}, {$push: {images: img}}, {safe: true, upsert: false})
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json(
                    {
                        message: "PUSHED PHOTOS",
                        files: req.files,
                        code: 0
                    });
            } else res.status(404).json({error: "Not_Found", code: 1});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, code: 1});
        });
});

router.delete('/:id/:photosId/', checkAuth, (req, res, next) => {
    const id = req.params.id;
    const pId = req.params.photosId;
    let fN='';
    Product.findOneAndUpdate({_id: id}, {$pull: {images: {_id: pId}}}, {multi: true})
        .exec()
        .then(doc => {
            if (doc) {
                for (let i=0; i<doc.images.length; i++) {
                    if (doc.images[i]._id.equals(pId)) {    //  !!!    USE EQUALS, NOT "==="   !!!
                        for (let t=0; t<doc.images[i].pathArr.length; t++) {
                            deleteFile(doc.images[i].pathArr[t].split('/').pop());    //  delete by filename
                        }
                    }
                }
                res.status(200).json(
                    {
                        message: "DELETED PHOTOS",
                        // pathArr: doc.im link + 'uploads/' + fN,
                        code: 0
                    });
            } else res.status(404).json({error: "Not_Found", code: 1});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, code: 1});
        });
});

router.post('/thumbnail/:id', upload.single('thumbnail'), checkAuth, (req, res, next) => {
    const id = req.params.id;
    const findAndUpdate = () => {
        Product.findOneAndUpdate({_id: id}, {$set: {thumbnail: req.file.path}}, {returnOriginal: false},)
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
    }

    Product.findById(id)
        .select("_id thumbnail")
        .exec()
        .then(doc => {
            if (doc) {
                findAndUpdate();//  call update
                if (req.file&&doc.thumbnail) deleteFile(doc.thumbnail.split('/').pop());//  del thumb
            } else res.status(404).json({error: "Not_Found", code: 1});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({data: req.params, error: err, code: 1});
        });

});

module.exports = router;