const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const List = require('../models/list.js');
const checkAuth = require('../middleware/check-auth');

const link = process.env.BASE_LINK;
const {selectArgsMinimized} = require("../utils/utils");
const Text = require("../models/text_block.js");

router.get('/', ((req, res, next) => {
    const locale = req.query.locale || "ua";
    let isAdmin = req.query.isAdmin;
    List.find().sort({index: -1})
        .select("_id name url index")
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                lists: docs.map(doc => {
                    return {
                        _id: doc._id,
                        name: isAdmin? doc.name:doc.name[locale],
                        url: doc.url,
                        index: doc.index,
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

router.get('/:url', (async (req, res, next) => {
    const url = req.params.url;
    const locale = req.query.locale || "ua";
    let cv = 1;
    let page = Number(req.query.page) - 1;
    let limit = Number(req.query.limit);
    let isAdmin = req.query.isAdmin || false;
    await Text.find({name: "currency_value"}, (e, doc) => {
        cv = parseFloat(doc[0].text['ua']);
    });
    List.findOne({url: url})
        .select("_id name url index items description keywords")
        .populate({path: 'items', select: selectArgsMinimized})
        .exec()
        .then(doc => {
            if (doc) {
                let items0 = [];
                for (let i = page * limit; i < page * limit + limit; i++) {
                    if (doc.items[i]) {
                        let item={...doc.items[i]._doc};
                        if (item.thumbnail) item.thumbnail = item.thumbnail[0]!=="h"? link+'uploads/'+item.thumbnail : item.thumbnail;
                        item.name = isAdmin? item.name:item.name[locale];
                        item.price = Math.floor(isAdmin ? item.price : item.price * cv);
                        items0.push(item);
                    }
                }
                const response = {
                    _id: doc._id,
                    name: isAdmin ? doc.name : doc.name[locale],
                    items: items0,
                    index: doc.index,
                    count: doc.items.length,
                    description: doc.description || null,
                    keywords: doc.keywords || [],
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
        name: {ua: req.body.name['ua'], ru: req.body.name['ru']},
        items: [],
        url: req.body.url,
        index: req.body.index,
    });
    product.save().then(result => {
        res.status(201).json({
            message: "CREATED",
            result: {
                _id: result._id,
                name: result.name,
                url: result.url,
                index: result.index,
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
        .select("_id name url index")
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