const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const List = require('../models/list.js');

const link = "http://localhost:5000/";
const selectArgsMinimized = "_id name url";
const selectArgsExtended = "_id name items url";

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
                        url: link+"lists/" + doc.url,
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
        .populate('product')
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

router.post('/', (req, res, next) => {
    const product = new List({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        items: [],
        url: req.body.url,
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

    let deleteProduct =()=> List.deleteOne({_id: id})
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

    List.findById(id)
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

router.patch('/:id', (req, res, next) => {
    const id = req.params.id;
    const updateOps = {};
    for (let [key, value] of Object.entries(req.body)) {
        updateOps[key] = value;
    }
    List.findOneAndUpdate({_id: id}, {$set: updateOps}, {returnOriginal: false},)
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json({
                    message: "PRODUCT UPDATED",
                    name: req.name,
                    url: req.url,
                    prev: doc,
                });
            } else res.status(404).json({error: "Not_Found"});
        })
        .catch(err => {
            res.status(500).json({error: err});
        });
});

module.exports = router;