const CryptoJS = require('crypto-js');
const AES_SECRET = process.env.AES_SECRET_KEY;

// Encrypt text
const encrypt = (text) => {
  if (!text) return null;
  return CryptoJS.AES.encrypt(text, AES_SECRET).toString();
};

// Decrypt text
const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, AES_SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error("Decryption failed:", e);
    return null;
  }
};

module.exports = { encrypt, decrypt };