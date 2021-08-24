const express = require('express');
const bcrypt = require('bcrypt');
const { readDat, writeDat } = require('../utils/handlingDat');
const router = express.Router();
let key = null;

exports.getKey = () => {
    return key;
}



router.get('/login/check', async (req, res) => {

    if (req.cookies.data === key) {
        res.status(200).json({ msg: "SUCCESS", code: 0 });
    } else {
        res.status(203).json({ msg: "NOT_MASTER", code: 1 });
    }
});

router.post('/login', async (req, res, next) => {
    let dat = readDat();
    //console.log(dat);
    let rightPW = false;
    bcrypt.compare(req.body.data, dat, (err, result) => {
        //console.log(result);
        rightPW = result;

        if (err) {
            res.status(500).json({ err: err, code: -1 });
        } else {

        //console.log("RP: " + rightPW);
        if (rightPW) {
            key = Math.random().toString(36).slice(-8);
            res.cookie(`data`, key, {
                maxAge: 24 * 60 * 60 * 1000, // 24 hours,
                //secure: true,
                //httpOnly: true,
                //sameSite: 'lax'
            });
            res.status(200).json({ msg: "SUCCESS", code: 0 });
        } else {
            res.status(401).json({ error: "UNAUTHORIZED", code: 1 });
        }
    }
    });

});

router.delete('/login', (req, res) => {
    res.clearCookie('data');
    res.status(200).json({ msg: "COOK_DELETED", code: 0 });
});

module.exports = router;