const express = require('express');
const router = express.Router();
const multer = require('multer');   //  needs for fetching form-data

const checkAuth = require('../middleware/check-auth');
const List = require('../models/list.js');

router.post('/:list_url', checkAuth, (req, res, next) => {
    const list_url = req.params.list_url;
    let pid=req.body.prodId;

    List.findOneAndUpdate({url: list_url}, { $push: {items: pid} }, {safe: true, upsert: false})
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json(
                    {
                        message: "PUSHED ITEM TO LIST", code: 0, productId: pid,
                    });
            } else res.status(404).json({error: "Not_Found", code: 1});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, code: 1});
        });
});

router.delete('/:url/:elId/', checkAuth, (req, res, next) => {
    const url = req.params.url;
    const elId = req.params.elId;
    List.updateOne({url: url}, { $pull: {items: elId } }, {multi: true})
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json(
                    {
                        message: "DELETED LIST ITEM", code: 0, productId: elId,
                    });
            } else res.status(404).json({error: "Not_Found", code: 1});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, code: 1});
        });
});

module.exports = router;