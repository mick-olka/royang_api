require('dotenv').config()
const express = require('express');
const app = express();
const path = require("path");
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookies = require("cookie-parser");
const checkAuth = require('./api/middleware/check-auth');
const productRoutes = require('./api/routes/products');
const productPhotosRoutes = require('./api/routes/productPhotos');
const listsRoutes = require('./api/routes/lists');
const listElementsRoutes = require('./api/routes/listElements');
const loginRoutes = require('./api/routes/admin');
const searchRoutes = require('./api/routes/search');
const orderRoutes = require('./api/routes/orders');
const sliderRoutes = require('./api/routes/slider');
const textRoutes = require('./api/routes/text_blocks');
const {restoreBackup, makeBackup} = require("./api/utils/data_backup");
let getCount=0;

mongoose.connect(process.env.MON_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    }).then(r => console.log("connected"));

app.use(cookies());
app.use(morgan(process.env.MORGAN_FORMAT)); //  dev
app.use('/uploads', express.static('uploads'));
app.use('/res', express.static('res'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    const corsWhiteList = [
        'http://192.168.50.163:3000',
        'http://192.168.0.113:3005',
        'http://192.168.1.164:3000',
        'http://192.168.1.24:3000',
        'http://192.168.1.24:3001',
        'http://localhost:3005',
        'http://192.168.1.243:3000',
        'http://178.54.240.228:3690',
        'http://185.65.245.26:3005',
        'http://185.65.245.26:3000'
    ];
    const origin=req.headers.origin;
    if  (corsWhiteList.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Credentials', "true");
    res.header('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Headers',
       "Origin, X-Requested-With, Content-Type, Accept, Authorisation");
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({options: "options"});
    }
    next();
});

app.get('/', (req, res) => {
    getCount++;
    res.send({invites: getCount, message: 'GET LOST'});
});

app.post('/', (req, res) => {
    res.send(req.body);
});

app.use('/products', productRoutes);
app.use('/photos', productPhotosRoutes);
app.use('/lists', listsRoutes);
app.use('/list_elements', listElementsRoutes);
app.use('/admin', loginRoutes);
app.use('/search', searchRoutes);
app.use('/orders', orderRoutes);
app.use('/slider', sliderRoutes);
app.use('/text', textRoutes);

app.get('/make_backup', checkAuth, async (req, res, next) => {
    try {
        await makeBackup();
        res.status(200).json({msg: "backup_done", code: 0});
    } catch (e) {
        res.status(500).json({error: e, code: 1});
    }
});

app.get('/restore_backup', checkAuth, async (req, res, next) => {
    try {
        await restoreBackup();
        res.status(200).json({msg: "backup_restored", code: 0});
    } catch (e) {
        res.status(500).json({error: e, code: 1});
    }
});

app.get('/download_archive_photos', checkAuth, (req, res, next) => {
    const file = path.resolve(__dirname, 'backup', 'photos.zip');
    res.download(file); // Set disposition and send it.
});

app.get('/download_archive_db', checkAuth, (req, res, next) => {
    const file = path.resolve(__dirname, 'backup', 'backup.tar');
    res.download(file); // Set disposition and send it.
});

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        message: error.message
    });
});

module.exports = app;