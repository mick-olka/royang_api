const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');   //  needs for fetching form-data

const List = require('../models/list.js');

const link = "http://localhost:5000/";

router.post('/:id', (req, res, next) => {
    const id = req.params.id;
    const el = {
        prodId: req.body.prodId,
    };
    List.findByIdAndUpdate({_id: id}, { $push: {items: el} }, {safe: true, upsert: false})
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json(
                    {
                        message: "PUSHED ITEM TO LIST",
                    });
            } else res.status(404).json({error: "Not_Found"});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

router.delete('/:id/:elId/', (req, res, next) => {
    const id = req.params.id;
    const elId = req.params.elId;
    Product.updateOne({_id: id}, { $pull: {items: { prodId: elId } } }, {multi: true})
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json(
                    {
                        message: "DELETED LIST ITEM",
                    });
            } else res.status(404).json({error: "Not_Found"});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

module.exports = router;