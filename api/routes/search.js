const express = require('express');
const router = express.Router();
const {selectArgsMinimized} = require('../utils/utils.js');

const Product = require('../models/product.js');
const {isNumeric} = require("../utils/utils");

router.get('/', async (req, res, next)=>{
    let search_string = String(req.query.str);
    let page = Number(req.query.page)-1;
    let limit = Number(req.query.limit);
    let count = 0;
    console.log(search_string);
    const regex = new RegExp(search_string, 'i') // i for case insensitive
    let filter = {name: {$regex: regex} };
    if (isNumeric(search_string)) filter = {code: {$regex: regex}};

    await Product.countDocuments(filter, function(err, c) {
        count=c;
    });

    Product.find(filter)
        .select(selectArgsMinimized)
        .limit(limit)
        .skip(page * limit)
        .exec()
        .then(result =>{
            let response = {
                count: count,
                result: result,
            }
            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json({error: err});
        });
});

module.exports = router;