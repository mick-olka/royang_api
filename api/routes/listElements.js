const express = require('express');
const router = express.Router();
const multer = require('multer');   //  needs for fetching form-data

const checkAuth = require('../middleware/check-auth');
const List = require('../models/list.js');
const Product = require('../models/product.js');

router.post('/:list_url', checkAuth, (req, res, next) => {
    const list_url = req.params.list_url;
    let pid=req.body.prodId;

    const addTypeToProduct = (type_name) => {
        Product.findByIdAndUpdate({_id: pid}, { $addToSet: {types: {name: type_name, url: list_url }}}, {safe: true, upsert: false})
        .exec()
        .then(doc=>{
            res.status(200).json({message: "PUSHED ITEM TO LIST", code: 0, productId: pid,});
        });
    }

    List.findOneAndUpdate({url: list_url}, { $addToSet: {items: pid} }, {safe: true, upsert: false})
        .exec()
        .then(doc => {
            if (doc) {
              addTypeToProduct(doc.name);
            } else res.status(404).json({error: "Not_Found", code: 1});
        })
        .catch(err => {console.log(err); res.status(500).json({error: err, code: 1});});
});

router.delete('/:url/:elId/', checkAuth, (req, res, next) => {
    const url = req.params.url;
    const elId = req.params.elId;

    const delTypeInProduct = (type_url) => {
        Product.findOneAndUpdate({_id: elId}, { $pull: {types: {url: type_url}}}, {safe: true, upsert: false})
        .exec()
        .then(doc=>{
            res.status(200).json( {message: "DELETED LIST ITEM", code: 0, productId: elId, });
        });
    }

    List.findOneAndUpdate({url: url}, { $pull: {items: elId } }, {multi: true})
        .exec()
        .then(doc => {
            if (doc) {
                delTypeInProduct(doc.url);
            } else res.status(404).json({error: "Not_Found", code: 1});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, code: 1});
        });
});

module.exports = router;