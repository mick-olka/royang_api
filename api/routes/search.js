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
    let locale = req.query.locale || "ua";
    let count = 0;
    let search_words = search_string.split(' ').join('|');
    const regex = new RegExp(search_words, 'i') // i for case insensitive
    let filter = {name:{ [locale]: {$regex: regex} } };
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
            let finalRes = results.map(i=>{
                return {...i._doc,
                    name: i.name[locale],
                    thumbnail: i.thumbnail && i.thumbnail[0]!=="h"? link + i.thumbnail : i.thumbnail
                };
            });
            let response = {
                count: count,
                result: finalRes,
            }
            console.log(finalRes);
            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json({error: err});
        });
});

module.exports = router;