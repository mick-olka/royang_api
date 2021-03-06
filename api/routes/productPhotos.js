const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');   //  needs for fetching form-data
const jimp = require("jimp");

const checkAuth = require('../middleware/check-auth');
const Product = require('../models/product.js');
const Photo = require('../models/photo.js');
const {deleteFile, upload, multi_upload} = require("../utils/utils");

const link = process.env.BASE_LINK;
let watermark;

const path = require('path');
const fs = require('fs');
// const dirPath = path.join(__dirname, 'res/gallery');

const process_photos = (files, max_size) => {

    for (let i=0; i<files.length; i++) {
        jimp.read(files[i].path, (err, img) => {
            if (err) throw err;
            else {
                img.scaleToFit(max_size, max_size) // resize
                    .quality(72) // set JPEG quality
                let w= img.getWidth(), h=img.getHeight();
                watermark.scaleToFit(w-100, 500);
                // .greyscale() // set greyscale
                img.composite( watermark, 50, h/2-145 )
                    .write(files[i].path); // save
            }
        });
    }

}

jimp.read(path.resolve(__dirname, "../../res", "watermark1.png"))
    .then(image => {
        watermark=image;
    })
    .catch(err => {
        console.log(err);
    });

router.post('/:id', multi_upload.array('pathArr', 20), (req, res, next) => {
    // console.log(req.files);
    const id = req.params.id;
    let pathArr = req.files.map(f=>{return f.path});
    process_photos(req.files, 1200);
    console.log(req.body);
    const img = new Photo({
        _id: new mongoose.Types.ObjectId(),
        pathArr: pathArr,
        mainColor: {ua: req.body.mainColorUA, ru: req.body.mainColorRU},
        pillColor: {ua: req.body.pillColorUA, ru: req.body.pillColorRU},
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

router.post('/thumbnail/:id', checkAuth, upload.single('thumbnail'), (req, res, next) => {
    const id = req.params.id;
    process_photos([req.file], 240);
    const findAndUpdate = () => {
        Product.findOneAndUpdate({_id: id}, {$set: {thumbnail: req.file.filename}}, {returnOriginal: false},)
            .exec()
            .then(doc => {
                res.status(200).json({
                    message: "THUMBNAIL UPDATED",
                    url: link + "products/" + id,
                    req: req.body,
                    file: link+'uploads/'+req.file.path,
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
                if (req.file && doc.thumbnail) deleteFile(doc.thumbnail);//  del thumb
            } else res.status(404).json({error: "Not_Found", code: 1});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({data: req.params, error: err, code: 1});
        });

});

router.get('/gallery', (async (req, res, next) => {

    fs.readdir("res/gallery", (err, files)=> {
        if (err) {
            res.status(500).json({error: err});
            return console.log('Unable to scan dir: '+err);
        }
        let readyFiles = files.map(file=>{
            return link+"res/gallery/"+file;
        });
        res.status(200).json(readyFiles);
    });
}));

router.get('/colors', (async (req, res, next) => {

    fs.readdir("res/colors", (err, files)=> {
        if (err) {
            res.status(500).json({error: err});
            return console.log('Unable to scan dir: '+err);
        }
        let readyFiles = files.map(file=>{
            // readyFiles[file.split('.')[0]] = link+"res/gallery/"+file;
            return {name: file.split('.')[0], src: link+"res/colors/"+file}
        });
        res.status(200).json(readyFiles);
    });
}));

module.exports = router;