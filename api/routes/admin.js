const express = require('express');
const bcrypt = require('bcrypt');
const { readDat, writeDat, getKey} = require('../utils/handlingDat');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const {setKey} = require('../utils/handlingDat')

router.get('/login/check', (req, res) => {
    console.log(getKey());
    if (req.cookies.data === getKey()) {
        res.status(200).json({ msg: "SUCCESS", code: 0 });
    } else {
        res.status(203).json({ msg: "NOT_MASTER", code: 1 });
    }
});

router.post('/login/pw', async (req, res) => {
    checkAuth;
    let dat = readDat();
    if (req.cookies.data === getKey()) {
        bcrypt.compare(req.body.oldData, dat, async (err, result) => {
            if (err) res.status(403).json({ msg: "Wrong", err: err, code: 1 });
            else if (req.body.data && result) {
                const salt = await bcrypt.genSalt(10);
                const newHashPW = await bcrypt.hash(req.body.data, salt);
                writeDat(newHashPW);
                res.clearCookie('data');
                res.status(200).json({ msg: "SUCCESS", code: 0 });
            } else { res.status(403).json({ msg: "No_Data", code: -1 }); }
        });

    } else { res.status(401).json({ msg: "No_Permission", code: 1 }); }
});

router.post('/login', (req, res, next) => {
    let dat = readDat();
    let rightPW = false;
    bcrypt.compare(req.body.data, dat, (err, result) => {
        rightPW = result;
        if (err) res.status(500).json({ err: err, code: -1 });
        else {
            if (rightPW) {
                setKey(Math.random().toString(36).slice(-8));
                res.cookie(`data`, getKey(), {
                    maxAge: 24 * 60 * 60 * 1000, // 24 hours,
                    // secure: true,
                    httpOnly: true,
                    // sameSite: 'lax'
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