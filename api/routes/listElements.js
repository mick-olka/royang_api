const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');   //  needs for fetching form-data

const List = require('../models/list.js');
const Product = require('../models/product');

const link = "http://localhost:5000/";

router.post('/:list_url', (req, res, next) => {
    const list_url = req.params.list_url;
    let pid=req.body.prodId;

    List.findOneAndUpdate({url: list_url}, { $push: {items: pid} }, {safe: true, upsert: false})
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

router.delete('/:url/:elId/', (req, res, next) => {
    const url = req.params.url;
    const elId = req.params.elId;
    List.updateOne({url: url}, { $pull: {items: elId } }, {multi: true})
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