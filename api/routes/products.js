const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {deleteFile} = require('../utils');
const checkAuth = require('../middleware/check-auth');

const multer = require('multer');   //

const Product = require('../models/product.js');

const link = "http://localhost:5000/";
const selectArgsMinimized = "_id name code price thumbnail url";
const selectArgsExtended = "_id name code price thumbnail figures images relatedProducts similarProducts otherFeatures url";

router.get('/', ((req, res, next) => {
    let page = Number(req.query.page);
    let limit = Number(req.query.limit);
    Product.find()
        .select(selectArgsMinimized)
        .limit(limit)
        .skip(page * limit)
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
                        url: link + "products/" + doc._id
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
                    images: doc.images,
                    figures: doc.figures,
                    relatedProducts: doc.relatedProducts,
                    similarProducts: doc.similarProducts,
                    otherFeatures: doc.otherFeatures,
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

router.post('/', checkAuth, (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        code: req.body.code,
        images: [],
        figures: req.body.figures,
        relatedProducts: [],
        similarProducts: [],
        otherFeatures: req.body.otherFeatures,
    });
    product.save().then(result => {
        console.log(result);
        res.status(201).json({
            message: "CREATED",
            code: 0,
            result: {
                _id: result._id,
                name: result.name,
                url: result.url,
            }
        });
    })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, code: 1});
        });
});

router.delete('/:id', checkAuth, (req, res, next) => {
    const id = req.params.id;

    let deleteProduct = () => Product.deleteOne({_id: id})
        .exec()
        .then(doc => {
            res.status(200).json({
                message: "DELETED", code: 0
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, code: 1});
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

router.patch('/:id', checkAuth, (req, res, next) => {
    const id = req.params.id;

    const updateOps = {};
    for (let [key, value] of Object.entries(req.body)) {
        updateOps[key] = value;
    }

    Product.findOneAndUpdate({_id: id}, {$set: updateOps}, {returnOriginal: false},)
        .exec()
        .then(doc => {
            res.status(200).json({
                message: "PRODUCT UPDATED",
                url: link + "products/" + id,
                req: req.body,
                code: 0,
            });
        })
        .catch(err => {
            res.status(500).json({error: err, code: 1});
        });

});

module.exports = router;