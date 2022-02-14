const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {deleteFile, selectArgsMinimized, selectArgsExtended} = require('../utils/utils.js');
const checkAuth = require('../middleware/check-auth');
const cyrillicToTranslit = require('cyrillic-to-translit-js');

const Product = require('../models/product.js');
//const {handleIP} = require("../utils/hanpleIPs");

const link = process.env.BASE_LINK;

router.get('/', (async (req, res, next) => {
    let page = Number(req.query.page)-1;
    let limit = Number(req.query.limit);
    let locale = req.query.locale || "ua";
    let isAdmin = req.query.isAdmin;
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
                        url_name: doc.url_name,
                        name: isAdmin ? doc.name : doc.name[locale],
                        code: doc.code,
                        price: doc.price,
                        oldPrice: doc.oldPrice || 0,
                        thumbnail: doc.thumbnail && doc.thumbnail[0]!=="h"? link + doc.thumbnail : doc.thumbnail,
                        url: link + "products/" + doc.url_name
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

router.get('/:url_name', ((req, res, next) => {
    const url_name = req.params.url_name;
    let locale = req.query.locale || "ua";
    let isAdmin = req.query.isAdmin;
    Product.findOne({url_name: {$regex: url_name} })
        .select(selectArgsExtended)
        .populate({path: 'relatedProducts', select: '_id url_name name code price thumbnail'})
        .populate({path: 'similarProducts', select: '_id url_name name code price thumbnail'})
        .exec()
        .then(doc => {
            if (doc) {
                let finalDoc = {...doc._doc};
                for (let i=0; i<finalDoc.relatedProducts.length; i++) {
                    finalDoc.relatedProducts[i].thumbnail=link+finalDoc.relatedProducts[i].thumbnail;
                }
                for (let i=0; i<finalDoc.similarProducts.length; i++) {
                    finalDoc.similarProducts[i].thumbnail=link+finalDoc.similarProducts[i].thumbnail;
                }

                for (let i=0; i<finalDoc.images.length; i++) {
                    for (let t=0; t<finalDoc.images[i].pathArr.length; t++) {
                        finalDoc.images[i].pathArr[t]=link+finalDoc.images[i].pathArr[t];
                    }
                }
                finalDoc.images = finalDoc.images.map(i=>{
                    return {...i._doc,
                        mainColor: isAdmin? i.mainColor : i.mainColor[locale],
                        pillColor: isAdmin? i.pillColor : i.pillColor[locale]};
                });
                const response = {
                    _id: finalDoc._id,
                    url_name: finalDoc.url_name,
                    name: isAdmin? finalDoc.name:finalDoc.name[locale],
                    code: finalDoc.code,
                    price: finalDoc.price,
                    oldPrice: finalDoc.oldPrice,
                    images: finalDoc.images,
                    index: finalDoc.index,
                    features: isAdmin? finalDoc.features : finalDoc.features[locale],
                    description: isAdmin? finalDoc.description : finalDoc.description[locale],
                    relatedProducts: finalDoc.relatedProducts,
                    similarProducts: finalDoc.similarProducts,
                    thumbnail: finalDoc.thumbnail && finalDoc.thumbnail[0]!=="h"? link + finalDoc.thumbnail : finalDoc.thumbnail,
                    types: finalDoc.types,
                    url: link + "products/" + finalDoc._id,
                }
                res.status(200).json(response);
            } else {
                Product.findOne({_id: url_name})
                    .select(selectArgsExtended)
                    .populate({path: 'relatedProducts', select: '_id url_name name code price thumbnail'})
                    .populate({path: 'similarProducts', select: '_id url_name name code price thumbnail'})
                    .exec()
                    .then(doc => {
                        if (doc) {
                            let finalDoc = {...doc._doc};
                            for (let i=0; i<finalDoc.relatedProducts.length; i++) {
                                finalDoc.relatedProducts[i].thumbnail=link+finalDoc.relatedProducts[i].thumbnail;
                            }
                            for (let i=0; i<finalDoc.similarProducts.length; i++) {
                                finalDoc.similarProducts[i].thumbnail=link+finalDoc.similarProducts[i].thumbnail;
                            }

                            for (let i=0; i<finalDoc.images.length; i++) {
                                for (let t=0; t<finalDoc.images[i].pathArr.length; t++) {
                                    finalDoc.images[i].pathArr[t]=link+finalDoc.images[i].pathArr[t];
                                }
                            }
                            finalDoc.images = finalDoc.images.map(i=>{
                                return {...i._doc,
                                    mainColor: isAdmin? i.mainColor : i.mainColor[locale],
                                    pillColor: isAdmin? i.pillColor : i.pillColor[locale]};
                            });
                            const response = {
                                _id: finalDoc._id,
                                url_name: finalDoc.url_name,
                                name: isAdmin? finalDoc.name:finalDoc.name[locale],
                                code: finalDoc.code,
                                price: finalDoc.price,
                                oldPrice: finalDoc.oldPrice,
                                images: finalDoc.images,
                                index: finalDoc.index,
                                features: isAdmin? finalDoc.features : finalDoc.features[locale],
                                description: isAdmin? finalDoc.description : finalDoc.description[locale],
                                relatedProducts: finalDoc.relatedProducts,
                                similarProducts: finalDoc.similarProducts,
                                thumbnail: finalDoc.thumbnail && finalDoc.thumbnail[0]!=="h"? link + finalDoc.thumbnail : finalDoc.thumbnail,
                                types: finalDoc.types,
                                url: link + "products/" + finalDoc._id,
                            }
                            // response.features = response.features.map(f=>{
                            //     return f[locale];
                            // });
                            res.status(200).json(response);
                        } else res.status(404).json({error: "Not_Found"});
                    }).catch(err=>{
                    console.log(err); res.status(500).json({error: err});});
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
}));

router.post('/', (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        url_name: req.body.url_name==="" ? cyrillicToTranslit().transform(req.body.name, "_") : req.body.url_name,
        price: req.body.price,
        oldPrice: req.body.oldPrice,
        code: req.body.code,
        features: req.body.features,
        description: req.body.description,
        index: req.body.index || 1,
        thumbnail: req.body.thumbnail || null,
        images: [],
        relatedProducts: [],
        similarProducts: [],
    });
    product.save().then(result => {
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

router.patch('/:id', (req, res, next) => {
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