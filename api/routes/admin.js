const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const link = process.env.BASE_LINK;

router.get('/login/check', (req, res) => {
    console.log(req.cookies);
    if (req.cookies.data) {
        res.status(200).json({msg: "SUCCESS", code: 0});
    } else {
        res.status(203).json({msg: "NOT_MASTER", code: 1});
    }
});

router.post('/login', (req, res, next) => {
    if (req.body.data===process.env.ADMIN_PW) {
        res.cookie(`data`, `yes`, {
            maxAge: 24 * 60 * 60 * 1000, // 24 hours,
            //secure: true,
            //httpOnly: true,
            //sameSite: 'lax'
        });
        res.status(200).json({msg: "SUCCESS", code: 0});
    } else {
        res.status(401).json({error: "UNAUTHORIZED", code: 1});
    }
});

router.delete('/login', (req, res) => {
    res.clearCookie('data');
    res.status(200).json({msg: "COOK_DELETED", code: 0});
});

module.exports = router;