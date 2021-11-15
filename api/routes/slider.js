const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Slide = require('../models/slide.js');
const checkAuth = require('../middleware/check-auth');
const {deleteFile, upload} = require("../utils/utils");

const link = process.env.BASE_LINK;
selectArgs="text lower_text img nav_link";

router.get('/', ((req, res, next) => {

    Slide.find()
        .select(selectArgs)
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                slides: docs.map(doc => {
                    return {
                        _id: doc._id,
                        text: doc.text,
                        lower_text: doc.lower_text,
                        img: link+doc.img,
                        nav_link: doc.nav_link,
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

router.post('/', checkAuth, upload.single('img'), (req, res, next) => {
    const slide = new Slide({
        _id: new mongoose.Types.ObjectId(),
        text: req.body.text,
        lower_text: req.body.lower_text,
        img: req.file.path,
        nav_link: req.body.nav_link,
    });
    slide.save().then(result => {
        res.status(201).json({
            message: "CREATED",
            result: {
                _id: result._id,
            },
            code: 0,
        });
    })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, code: 1});
        });
});

router.delete('/:id', checkAuth, (req, res, next) => {
    const id = req.params.id;

    let deleteSlide =()=> Slide.deleteOne({_id: id})
        .exec()
        .then(doc => {
            res.status(200).json({
                message: "DELETED", code: 0,
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, code: 1});
        });

    Slide.findOne({_id: id})
        .select(selectArgs)
        .exec()
        .then(doc => {
            if (doc) {
                deleteFile(doc.img.split('/').pop());
                deleteSlide();
            } else res.status(404).json({error: "Not_Found"});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

router.patch('/:id', checkAuth, upload.single('img'), (req, res, next) => {
    const id = req.params.id;
    const updateOps = {};
    for (let [key, value] of Object.entries(req.body)) {
        updateOps[key] = value;
    }
    if (req.file) {
        updateOps.img=req.file.path;
    }
    Slide.findOneAndUpdate({_id: id}, {$set: updateOps}, {returnOriginal: true})
        .exec()
        .then(doc => {
            if (doc) {
                if (req.file && doc.img) {
                    deleteFile(doc.img.split('/').pop());
                }
                res.status(200).json({
                    prev: doc,
                    message: "SLIDE UPDATED",
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