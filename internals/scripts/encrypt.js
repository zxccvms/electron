const crypto = require("crypto"); //用来加密
const fs = require("fs");
const zlib = require("zlib"); //用来压缩
const path = require('path')

const [inFilePath] = process.argv.slice(2);
const dirPath = path.dirname(inFilePath)
const fileName = path.basename(inFilePath, '.js')
const outFilePath = path.join(dirPath, fileName)
const salt = 'slat'

const password = new Buffer(salt);
const encryptStream = crypto.createCipher("aes-256-cbc", password);

const gzip = zlib.createGzip();
const readStream = fs.createReadStream(inFilePath);
const writeStream = fs.createWriteStream(outFilePath);

readStream //读取
  .pipe(encryptStream) //加密
  .pipe(gzip) //压缩
  .pipe(writeStream) //写入
  .on("finish", function () {
    //写入结束的回调
    console.log("done!!! out file: ", outFilePath);
  });

