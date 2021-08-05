const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const link = "http://localhost:5000/";

router.get('/login/check', (req, res) => {
    console.log(req.cookies);
    if (req.cookies.data) {
        res.status(200).json({msg: "SUCCESS", code: 0});
    } else {
        res.status(404).json({error: "Data_Error", code: 1});
    }
});

router.post('/login', (req, res, next) => {
    if (req.body.data===process.env.ADMIN_PW) {
        res.cookie(`data`, `yes`, {
            maxAge: 24 * 60 * 60 * 1000, // 24 hours,
            secure: true,
            httpOnly: true,
            //sameSite: 'lax'
        });
        res.status(200).json({msg: "SUCCESS", code: 0});
    } else {
        res.status(404).json({error: "Data_Error", code: 1});
    }
});

router.delete('/login', (req, res) => {
    res.clearCookie();
    res.status(200).json({msg: "COOK_DELETED", code: 1});
});

module.exports = router;