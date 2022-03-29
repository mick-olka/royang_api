const fs = require("fs");
const path = require("path");
const archiver = require('archiver');
const backup_mongo = path.resolve(__dirname, '../../backup', 'backup.tar');
const backup_uploads = path.resolve(__dirname, '../../backup', 'uploads');
const backup_archive = path.resolve(__dirname, '../../backup', 'photos.zip');
const uploads = path.resolve(__dirname, '../../uploads');
const { MongoTransferer, MongoDBDuplexConnector, LocalFileSystemDuplexConnector } = require('mongodb-snapshot');
const Product = require('../models/product.js');
const Text = require('../models/text_block.js');
const List = require('../models/list.js');

exports.makeBackup = () => {
   copyAllFiles(uploads, backup_uploads);
   archivePhotos();
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

const archivePhotos = () => {

// create a file to stream archive data to.
    const output = fs.createWriteStream(backup_archive);
    const archive = archiver('zip', {
        zlib: {level: 9} // Sets the compression level.
    });

// listen for all archive data to be written
// 'close' event is fired only when a file descriptor is involved
    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });

// This event is fired when the data source is drained no matter what was the data source.
// It is not part of this library but rather from the NodeJS Stream API.
// @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on('end', function () {
        console.log('Data has been drained');
    });

// good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            // log warning
            console.log(err);
        } else {
            // throw error
            throw err;
        }
    });

// good practice to catch this error explicitly
    archive.on('error', function (err) {
        throw err;
    });

// pipe archive data to the file
    archive.pipe(output);

// append files from a sub-directory and naming it `new-subdir` within the archive
    archive.directory(backup_uploads, 'uploads');

// finalize the archive (ie we are done appending files but streams have to finish yet)
// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();

}