const express = require('express');
const router = express.Router();
const {selectArgsMinimized} = require('../utils/utils.js');

const Product = require('../models/product.js');
const {isNumeric} = require("../utils/utils");

router.get('/', (req, res, next)=>{
    let search_string = String(req.query.str);
    //const str = req.body.string;
    console.log(search_string);
    const regex = new RegExp(search_string, 'i') // i for case insensitive
    let filter = {name: {$regex: regex} };
    if (isNumeric(search_string)) filter = {code: {$regex: regex}};
    Product.find(filter)
        .select(selectArgsMinimized)
        .exec()
        .then(result =>{
            res.status(200).json(result);
        })
        .catch(err => {
            res.status(500).json({error: err});
        });
});

module.exports = router;