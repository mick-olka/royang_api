const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const List = require('../models/list.js');
const checkAuth = require('../middleware/check-auth');

const link = process.env.BASE_LINK;
const {selectArgsMinimized, selectArgsExtended} = require("../utils/utils");

router.get('/', ((req, res, next) => {

    List.find()
        .select(selectArgsMinimized)
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                lists: docs.map(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        url: doc.url,
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

router.get('/:url', ((req, res, next) => {
    const url = req.params.url;
    List.findOne({url: url})
        .select(selectArgsExtended)
        .populate({path: 'items', select: selectArgsMinimized})
        .exec()
        .then(doc => {
            if (doc) {
                const response = {
                    _id: doc._id,
                    name: doc.name,
                    items: doc.items,
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
    const product = new List({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        items: [],
        url: req.body.url,
    });
    product.save().then(result => {
        res.status(201).json({
            message: "CREATED",
            result: {
                _id: result._id,
                name: result.name,
                url: result.url,
            },
            code: 0,
        });
    })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, code: 1});
        });
});

router.delete('/:url', checkAuth, (req, res, next) => {
    const url = req.params.url;

    let deleteProduct =()=> List.deleteOne({url: url})
        .exec()
        .then(doc => {
            res.status(200).json({
                message: "DELETED", code: 0, url: url,
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, code: 1});
        });

    List.findOne({url: url})
        .select(selectArgsExtended)
        .exec()
        .then(doc => {
            if (doc) {
                deleteProduct();
            } else res.status(404).json({error: "Not_Found"});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

router.patch('/:url', checkAuth, (req, res, next) => {
    const url = req.params.url;
    const updateOps = {};
    for (let [key, value] of Object.entries(req.body)) {
        updateOps[key] = value;
    }
    List.findOneAndUpdate({url: url}, {$set: updateOps}, {returnOriginal: false},)
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json({
                    message: "PRODUCT UPDATED",
                    updatedData: updateOps,
                    code: 0,
                });
            } else res.status(404).json({error: "Not_Found", code: 1});
        })
        .catch(err => {
            res.status(500).json({error: err, code: 1});
        });
});

module.exports = router;