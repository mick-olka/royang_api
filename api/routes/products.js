const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {deleteFile, selectArgsMinimized, selectArgsExtended} = require('../utils/utils.js');
const checkAuth = require('../middleware/check-auth');

const multer = require('multer');   //

const Product = require('../models/product.js');
//const {handleIP} = require("../utils/hanpleIPs");

const link = process.env.BASE_LINK;

router.get('/', (async (req, res, next) => {
    //console.log(req.ip);
    //console.log(handleIP(req.ip, 2));
    let page = Number(req.query.page)-1;
    let limit = Number(req.query.limit);
    let count = 0;
    await Product.countDocuments({}, function(err, c) {
        count=c;
    });
    Product.find().sort({index: -1})
        .select(selectArgsMinimized)
        .limit(limit)
        .skip(page * limit)
        .exec()
        .then(docs => {
            const response = {
                count: count,
                products: docs.map(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        code: doc.code,
                        price: doc.price,
                        oldPrice: doc.oldPrice,
                        thumbnail: link + doc.thumbnail,
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
        .populate({path: 'relatedProducts', select: '_id name code price thumbnail'})
        .populate({path: 'similarProducts', select: '_id name code price thumbnail'})
        .exec()
        .then(doc => {
            if (doc) {

                for (let i=0; i<doc.relatedProducts.length; i++) {
                    doc.relatedProducts[i].thumbnail=link+doc.relatedProducts[i].thumbnail;
                }
                for (let i=0; i<doc.similarProducts.length; i++) {
                    doc.similarProducts[i].thumbnail=link+doc.similarProducts[i].thumbnail;
                }

                for (let i=0; i<doc.images.length; i++) {
                    for (let t=0; t<doc.images[i].pathArr.length; t++) {
                        doc.images[i].pathArr[t]=link+doc.images[i].pathArr[t];
                    }
                }
                const response = {
                    _id: doc._id,
                    name: doc.name,
                    code: doc.code,
                    price: doc.price,
                    oldPrice: doc.oldPrice,
                    images: doc.images,
                    index: doc.index,
                    features: doc.features,
                    description: doc.description,
                    relatedProducts: doc.relatedProducts,
                    similarProducts: doc.similarProducts,
                    thumbnail: link + doc.thumbnail,
                    types: doc.types,
                    url: link + "products/" + doc._id,
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
        oldPrice: req.body.oldPrice,
        code: req.body.code,
        features: req.body.features,
        description: req.body.description,
        index: req.body.index,
        images: [],
        relatedProducts: [],
        similarProducts: [],
    });
    product.save().then(result => {
        console.log(result);
        res.status(201).json({
            message: "CREATED",
            code: 0,
            result: {
                _id: result._id,
                name: result.name,
                url: link + "products/" + result._id,
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
                message: "DELETED", code: 0, _id: id,
            });
        });

    Product.findById(id)
        .select(selectArgsExtended)
        .exec()
        .then(doc => {
            if (doc) {
                let imgs = doc.images;
                for (let i = 0; i < imgs.length; i++) {
                    for (let t=0; t<imgs[i].pathArr.length; t++) {
                        deleteFile(imgs[i].pathArr[t].split('/').pop());
                    }
                }
                if (doc.thumbnail) deleteFile(doc.thumbnail.split("/").pop());
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