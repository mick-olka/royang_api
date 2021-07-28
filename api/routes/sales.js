const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const {upload, deleteFile} = require('../utils');

const link = "http://localhost:5000/";
const selectArgs = "title info _id oldPrice newPrice images preview endDate";

const Sale = require('../models/sale.js');
const Photo = require('../models/photo.js');

router.get('/', ((req, res, next) => {
    Sale.find()
        .select(selectArgs)
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        _id: doc._id,
                        title: doc.title,
                        info: doc.info,
                        oldPrice: doc.oldPrice,
                        newPrice: doc.newPrice,
                        images: doc.images,
                        preview: doc.preview,
                        endDate: doc.endDate,
                        url: link+"sales/" + doc._id
                    }
                })
            }
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
}));

router.get('/:id', ((req, res, next) => {
    const id = req.params.id;
    Sale.findById(id)
        .select(selectArgs)
        .exec()
        .then(doc => {
            if (doc) {
                const response = {
                    _id: doc._id,
                    title: doc.title,
                    info: doc.info,
                    oldPrice: doc.oldPrice,
                    newPrice: doc.newPrice,
                    images: doc.images,
                    preview: doc.preview,
                    endDate: doc.endDate,
                    url: link + "sales/" + doc._id
                }
                res.status(200).json(response);
            } else res.status(404).json({err: "Not_Found"});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
}));

router.post('/', upload.single('preview'), (req, res, next) => {
    const sale = new Sale({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        info: req.body.info,
        oldPrice: req.body.oldPrice,
        newPrice: req.body.newPrice,
        endDate: req.body.endDate,
        images: [],
        preview: link + req.file.path,
    });
    sale.save().then(result => {
        console.log(result);
        res.status(201).json({
            message: "SALE CREATED",
            result: {
                name: result.name,
                price: result.price,
                _id: result._id,
                thumbnail: result.thumbnail,
                url: link + "sales/" + result._id
            }
        });
    })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

router.post('/:id/photos', upload.single('path'), (req, res, next) => {
    const id = req.params.id;
    const img = new Photo({
        _id: new mongoose.Types.ObjectId(),
        filename: req.file.filename,
        path:  link + req.file.path,
        mainColor: req.body.mainColor,
        pillColor: req.body.pillColor
    });
    Sale.findByIdAndUpdate({_id: id}, { $push: {images: img} }, {safe: true, upsert: false})
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json(
                    {
                        message: "PUSHED PHOTO",
                        url: link + req.file.path,
                        filename: req.file.filename,
                    });
            } else res.status(404).json({error: "Not_Found"});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

router.delete('/:id', (req, res, next)=> {
    const id = req.params.id;

    let deleteSale =()=> Sale.deleteOne({_id: id})
        .exec()
        .then(doc => {
            res.status(200).json({
                message: "SALE DELETED"
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });

    Sale.findById(id)
        .select('title info _id images oldPrice newPrice endDate preview')
        .exec()
        .then(doc => {
            if (doc) {
                let imgs = doc.images;
                for (let i = 0; i < imgs.length; i++) {
                    deleteFile(imgs[i].filename);
                }
                deleteFile(doc.preview.split("/").pop());
                deleteSale();
            } else res.status(404).json({error: "Not_Found"});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });

});

router.delete('/:id/photos/:fileName/', (req, res, next) => {
    const id = req.params.id;
    const fN = req.params.fileName;
    Sale.updateOne({_id: id}, { $pull: {images: { filename: fN } } }, {multi: true})
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

router.patch('/:id', upload.single('preview'), (req, res, next) => {
    const id = req.params.id;
    const updateOps = {};
    for (let [key, value] of Object.entries(req.body)) {
        updateOps[key] = value;
    }
    if (req.file) {updateOps["preview"]=link + req.file.path;}
    Sale.findOneAndUpdate({_id: id}, {$set: updateOps}, {returnOriginal: false}, )
        .exec()
        .then(doc => {
            if (doc) {
                if (req.file) {
                    deleteFile(doc.preview.split("/").pop());
                }
                res.status(200).json({
                    message: "SALE UPDATED",
                    url: link + "sales/" + id,
                    req: req.body,
                    prev: doc,
                });
            } else res.status(404).json({error: "Not_Found"});
        })
        .catch(err => {
            res.status(500).json({error: err});
        });
});

module.exports = router;