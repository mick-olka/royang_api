const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {upload, deleteFile} = require('../utils');

const Product = require('../models/product.js');

const link = "http://localhost:5000/";
const selectArgsMinimized = "_id name code price thumbnail url";
const selectArgsExtended = "_id name code price thumbnail figures images relatedProducts similarProducts otherFeatures url";

router.get('/', ((req, res, next) => {
    let page = req.query.page;
    let limit = req.query.limit;
    Product.find()
        .select(selectArgsMinimized)
        .limit(limit)
        .skip(page*limit)
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        code: doc.code,
                        price: doc.price,
                        thumbnail: doc.thumbnail,
                        url: "http://localhost:5000/products/" + doc._id
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
    Product.findById(id)
        .select(selectArgsExtended)
        .exec()
        .then(doc => {
            if (doc) {
                const response = {
                    _id: doc._id,
                    name: doc.name,
                    code: doc.code,
                    price: doc.price,
                    type: doc.type,
                    images: doc.images,
                    thumbnail: doc.thumbnail,
                    url: doc.url,
                }
                res.status(200).json(response);
            } else res.status(404).json({error: "Not_Found"});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
}));

router.post('/', upload.single('thumbnail'), (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        code: req.body.code,
        type: req.body.type,
        images: [],
        thumbnail: link + req.file.path,
        figures: {
          height: req.body.height,
          width: req.body.width,
          depth: req.body.depth,
          weight: req.body.weight,
        },
        relatedProducts: [],
        similarProducts: [],
        url: link + "products/" + this._id,
        otherFeatures: [],
    });
    product.save().then(result => {
        console.log(result);
        res.status(201).json({
            message: "CREATED",
            result: {
                _id: result._id,
                name: result.name,
                url: result.url,
            }
        });
    })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

router.delete('/:id', (req, res, next) => {
    const id = req.params.id;

    let deleteProduct =()=> Product.deleteOne({_id: id})
        .exec()
        .then(doc => {
            res.status(200).json({
                message: "DELETED"
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });

    Product.findById(id)
        .select(selectArgsExtended)
        .exec()
        .then(doc => {
            if (doc) {
                let imgs = doc.images;
                for (let i = 0; i < imgs.length; i++) {
                    deleteFile(imgs[i].filename);
                }
                deleteFile(doc.thumbnail.split("/").pop());
                deleteProduct();
            } else res.status(404).json({error: "Not_Found"});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

router.patch('/:id', upload.single('thumbnail'), (req, res, next) => {
    const id = req.params.id;
    const updateOps = {};
    for (let [key, value] of Object.entries(req.body)) {
        updateOps[key] = value;
    }
    if (req.file) {
        updateOps["thumbnail"] = link + req.file.path;
    }
    Product.findOneAndUpdate({_id: id}, {$set: updateOps}, {returnOriginal: false},)
        .exec()
        .then(doc => {
            if (doc) {
                if (req.file) {
                    deleteFile(doc.thumbnail.split("/").pop());
                }
                res.status(200).json({
                    message: "PRODUCT UPDATED",
                    url: link + "products/" + id,
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