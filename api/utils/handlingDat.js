//const fs = require('fs');
const fs = require('fs');
const bcrypt = require('bcrypt');

//let readFile = fs.readFile(__dirname+"/dat.txt", 'utf-8');

exports.readDat=()=>{
    return fs.readFileSync(__dirname+"/dat.txt", 'utf-8');
}

exports.writeDat=(dat)=>{fs.writeFile(__dirname+"/dat.txt", dat, (err)=>{
    if (err) console.log(err);
});
}

let key = null;

exports.key=key;

exports.setKey = (key0) => {
    key=key0;
    console.log(key);
}

exports.getKey = () => {
    return key;
}
