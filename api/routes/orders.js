const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order.js');
const checkAuth = require('../middleware/check-auth');

const link = process.env.BASE_LINK;
const {selectArgsMinimized, selectArgsExtended} = require('../utils/utils.js');
const {handleIP} = require("../utils/hanpleIPs");

const selectOrderArgsMinimized="_id name phone status date";
const selectOrderArgsExtended="_id name phone message cart sum status date";

const { Telegraf } = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)

let chatId=null;
bot.start((ctx) => {ctx.reply('Welcome'); if (chatId==null) chatId=ctx.message.chat.id});
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

router.get('/', checkAuth, (async (req, res, next) => {
    let page = Number(req.query.page)-1;
    let limit = Number(req.query.limit);
    let count = 0;
    await Order.countDocuments({}, function(err, c) {
        count=c;
    });

    Order.find()
        .select(selectOrderArgsMinimized)
        .limit(limit)
        .skip(page * limit)
        .exec()
        .then(docs => {
            const response = {
                count: count,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        phone: doc.phone,
                        status: doc.status,
                        date: doc.date,
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

router.get('/:_id', checkAuth, ((req, res, next) => {
    const _id = req.params._id;
    Order.findOne({_id: _id})
        .select(selectOrderArgsExtended)
        .populate({path: 'cart.product', select: selectArgsMinimized})
        .exec()
        .then(doc => {
            if (doc) {

                const response = {
                    _id: doc._id,
                    name: doc.name,
                    phone: doc.phone,
                    cart: doc.cart,
                    message: doc.message,
                    sum: doc.sum,
                    status: doc.status,
                    date: doc.date,
                }
                res.status(200).json(response);
            } else res.status(404).json({error: "Not_Found"});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
}));

router.post('/', async (req, res, next) => {
    let didIpSendToManyReq = handleIP(req.ip, 2);
    const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        phone: req.body.phone,
        message: req.body.message,
        cart: req.body.cart,
        sum: req.body.sum,
        status: "waiting",
        date: Date.now() + 1000 * 60 * 60 * 3,
    });
    let cartText = "";
    for (let i=0; i<order.cart.length; i++) {
        let cartItemText=`# ${req.body.cart[i].name} ${order.cart[i].count} шт. MC: ${order.cart[i].mainColor} PC: ${order.cart[i].pillColor}`;
        cartText=cartText+`\n${cartItemText}`;
    }
    let tgMsg = `New Order\n\n${order.name}\n${order.phone}\n msg: ${order.message}\n sum: ${order.sum}\n${cartText}`;

    if (didIpSendToManyReq === 1) {
        res.status(429).json({msg: "Too Many Orders", code: 1});
    } else {
        if (chatId) await bot.telegram.sendMessage(chatId, tgMsg);  //
        order.save().then(result => {
        res.status(201).json({
            message: "ORDER CREATED",
            result: {
                _id: result._id,
                name: result.name,
                phone: result.phone,
            },
            code: 0,
        });
    })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, code: 1});
        });
}
});

router.delete('/:_id', checkAuth, (req, res, next) => {
    const _id = req.params._id;

    Order.findOneAndDelete({_id: _id})
        .exec()
        .then(doc => {
            res.status(200).json({
                message: "ORDER DELETED", code: 0, _id: doc._id,
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, code: 1});
        });
});

router.patch('/:_id', checkAuth, (req, res, next) => {
    const _id = req.params._id;
    const updateOps = {};
    for (let [key, value] of Object.entries(req.body)) {
        updateOps[key] = value;
    }
    Order.findOneAndUpdate({_id: _id}, {$set: updateOps}, {returnOriginal: false},)
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json({
                    message: "ORDER UPDATED",
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