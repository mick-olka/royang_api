const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Text_block = require('../models/text_block');
const checkAuth = require('../middleware/check-auth');

const link = process.env.BASE_LINK;
const selectArgs = "_id name text nav_link";

router.get('/', ((req, res, next) => {

    Text_block.find()
        .select(selectArgs)
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                text_blocks: docs.map(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        text: doc.text,
                        nav_link: doc.nav_link,
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

router.get('/:name', ((req, res, next) => {
    const name = req.params.name;

    Text_block.findOne({name: name})
        .select(selectArgs)
        .exec()
        .then(doc => {
            if (doc) {
                const response = {
                    _id: doc._id,
                    name: doc.name,
                    text: doc.text,
                    nav_link: doc.nav_link,
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
    const new_text = new Text_block({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        text: req.body.text,
        nav_link: req.body.nav_link,
    });
    new_text.save().then(result => {
        res.status(201).json({
            message: "CREATED TEXT",
            result: {
                _id: result._id,
                name: result.name,
                text: result.text,
            },
            code: 0,
        });
    })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, code: 1});
        });
});

router.delete('/:name', checkAuth, (req, res, next) => {
    const name = req.params.name;

    let deleteProduct =()=> Text_block.deleteOne({name: name})
        .exec()
        .then(doc => {
            res.status(200).json({
                message: "DELETED", code: 0, name: name,
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, code: 1});
        });

    Text_block.findOne({name: name})
        .select(selectArgs)
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

router.patch('/:name', checkAuth, (req, res, next) => {
    const name = req.params.name;
    const updateOps = {};
    for (let [key, value] of Object.entries(req.body)) {
        updateOps[key] = value;
    }
    Text_block.findOneAndUpdate({name: name}, {$set: updateOps}, {returnOriginal: false},)
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