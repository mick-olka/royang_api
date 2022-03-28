const fs = require("fs");
const path = require("path");
const backup_mongo = path.resolve(__dirname, '../../backup', 'backup.tar');
const backup_uploads = path.resolve(__dirname, '../../backup', 'uploads');
const uploads = path.resolve(__dirname, '../../uploads');
const { MongoTransferer, MongoDBDuplexConnector, LocalFileSystemDuplexConnector } = require('mongodb-snapshot');
const Product = require('../models/product.js');
const Text = require('../models/text_block.js');
const List = require('../models/list.js');

exports.makeBackup = () => {
   copyAllFiles(uploads, backup_uploads);
    dumpMongo2Localfile().then(()=>{
        return 0;
    }).catch(e=>{
        console.log(e);
        return 1;
    });
}

exports.restoreBackup = () => {
    copyAllFiles(backup_uploads, uploads);
    deleteAllCollections();
    restoreLocalfile2Mongo('rotang').then(()=>{
        return 0;
    }).catch(e=>{
        console.log(e);
        return 1;
    });
}

const copyAllFiles = (src, dest) => {
    let exists = fs.existsSync(src);
    if (!exists) fs.mkdirSync(src);
    else delAllFiles(dest);
    let files = fs.readdirSync(src);
    files.forEach(f => {
        let dat = fs.readFileSync(`${src}/${f}`);
        fs.writeFileSync(`${dest}/${f}`, dat);
    });
}

const delAllFiles = (directory) => {
    fs.readdir(directory, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }
    });
}


async function dumpMongo2Localfile() {
    const mongo_connector = new MongoDBDuplexConnector({
        connection: {
            uri: process.env.MON_URI,
            dbname: process.env.MON_URI.split('/').pop(),
        },
    });

    const localfile_connector = new LocalFileSystemDuplexConnector({
        connection: {
            path: backup_mongo,
        },
    });

    const transferer = new MongoTransferer({
        source: mongo_connector,
        targets: [localfile_connector],
    });

    for await (const { total, write } of transferer) {
        console.log(`remaining bytes to write: ${total - write}`);
    }
}

async function restoreLocalfile2Mongo(dbname) {
    const mongo_connector = new MongoDBDuplexConnector({
        connection: {
            uri: process.env.MON_URI,
            dbname: dbname,
        },
    });

    const localfile_connector = new LocalFileSystemDuplexConnector({
        connection: {
            path: backup_mongo,
        },
    });

    const transferer = new MongoTransferer({
        source: localfile_connector,
        targets: [mongo_connector],
    });

    for await (const { total, write } of transferer) {
        console.log(`remaining bytes to write: ${total - write}`);
    }
}

const deleteAllCollections = () => {
    Product.remove({}, function(err) {
        console.log('Products -- collection removed');
    });
    Text.remove({}, function(err) {
        console.log('Text -- collection removed');
    });
    List.remove({}, function(err) {
        console.log('List -- collection removed');
    });
}