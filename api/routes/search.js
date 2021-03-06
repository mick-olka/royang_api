const express = require('express');
const router = express.Router();
const {selectArgsMinimized} = require('../utils/utils.js');

const Product = require('../models/product.js');
const Text = require('../models/text_block.js');
const link = process.env.BASE_LINK;

router.get('/', async (req, res, next)=>{
    let search_string = String(req.query.str);
    let page = Number(req.query.page)-1;
    let limit = Number(req.query.limit);
    let isAdmin = req.query.isAdmin || false;
    let locale = req.query.locale || "ua";
    let count = 0, cv = 1;
    let search_words = search_string.split(' ').join('|');
    const regex = new RegExp(search_words, 'i') // i for case insensitive
    let filter = {$or:[ {"name.ua":{$regex: regex }}, {"name.ru":{$regex: regex} }, {code: {$regex: regex}} ]};
    // if (isNumeric(search_string)) filter = {code: {$regex: regex}};

    await Text.find({name: "currency_value"}, (e, doc)=> {
        cv=parseFloat(doc[0].text['ua']);
    });
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
                    thumbnail: i.thumbnail && i.thumbnail[0]!=="h"? link + i.thumbnail : i.thumbnail,
                    price: Math.floor(isAdmin ? i.price : i.price * cv),
                    oldPrice: Math.floor(isAdmin ? i.oldPrice : i.oldPrice * cv) || 0
                };
            });
            let response = {
                count: count,
                result: finalRes,
            }
            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json({error: err});
        });
});

module.exports = router;