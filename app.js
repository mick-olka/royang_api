
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const productPhotosRoutes = require('./api/routes/productPhotos');
const salesRoutes = require('./api/routes/sales');
const listsRoutes = require('./api/routes/lists');
let getCount=0;

mongoose.connect("mongodb+srv://mick:1234qwer@cluster0.za5fi.mongodb.net/Shop?retryWrites=true&w=majority",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    });

app.use(morgan('dev')); //  dev
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());



app.use((req, res, next) => {
    const corsWhiteList = [
        'http://192.168.1.164:3000',
        'http://localhost:3000',
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
app.use('/sales', salesRoutes);
app.use('/lists', listsRoutes);

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