const crypto = require('crypto');

//for AES encryption
const aes_algorithm = 'aes-256-cbc';
const aes_key = 'noob-key-32-characters-length...';
const aes_iv = crypto.randomBytes(16);

function aesEncrypt(text) {
    let cipher = crypto.createCipheriv(aes_algorithm, Buffer.from(aes_key), aes_iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return {iv: aes_iv.toString('hex'), encryptedData: encrypted.toString('hex')};
}

function aesDecrypt(text) {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv(aes_algorithm, Buffer.from(aes_key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

function genUUID() {
    return crypto.randomUUID()
}

module.exports = {encrypt: aesEncrypt, decrypt: aesDecrypt, genUUID}