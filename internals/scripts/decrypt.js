const crypto = require("crypto");//用来加密
const fs = require("fs");
const zlib = require("zlib");//用来压缩

const [inFilePath] = process.argv.slice(2);
const salt = 'slat'

const password = new Buffer(salt);
const decryptStream = crypto.createDecipher('aes-256-cbc', password);

const gzip = zlib.createGunzip();//解压
const readStream = fs.createReadStream(inFilePath);

let content = ''

readStream//读取
  .pipe(gzip)//解压
  .pipe(decryptStream)//解密
  .on('data', (chunk) => content += chunk)
  .on('finish', () => console.log('done!!! out content: ', content))
  .on('error', e => console.error('readStream error: ', e))
