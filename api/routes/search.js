const express = require('express');
const router = express.Router();
const {selectArgsMinimized} = require('../utils/utils.js');

const Product = require('../models/product.js');
const {isNumeric} = require("../utils/utils");
const link = process.env.BASE_LINK;

router.get('/', async (req, res, next)=>{
    let search_string = String(req.query.str);
    let page = Number(req.query.page)-1;
    let limit = Number(req.query.limit);
    let count = 0;
    let search_words = search_string.split(' ').join('|');
    const regex = new RegExp(search_words, 'i') // i for case insensitive
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
        .then(results =>{
            for (let i=0; i<results.length; i++) {
                results[i].thumbnail = results[i].thumbnail && results[i].thumbnail[0]!=="h"? link + results[i].thumbnail : results[i].thumbnail;
            }
            let response = {
                count: count,
                result: results,
            }
            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json({error: err});
        });
});

module.exports = router;