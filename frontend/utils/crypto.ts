import crypto from 'crypto-js';
import CONFIG from '@/assets/config';

const encrypt = (text: string, iv: string = CONFIG.aes): string =>
    crypto.AES.encrypt(text, crypto.enc.Utf8.parse(iv), {
        iv: crypto.enc.Utf8.parse(iv),
        mode: crypto.mode.CBC,
        padding: crypto.pad.Pkcs7,
    }).toString();

const decrypt = (text: string, iv: string = CONFIG.aes): string => {
    const decrypted = crypto.AES.decrypt(text, crypto.enc.Utf8.parse(iv), {
        iv: crypto.enc.Utf8.parse(iv),
        mode: crypto.mode.CBC,
        padding: crypto.pad.Pkcs7,
    });
    return decrypted.toString(crypto.enc.Utf8);
};

const base64Encrypt = (text: string): string => {
    const wordArray = crypto.enc.Utf8.parse(text);
    return crypto.enc.Base64.stringify(wordArray);
};

const base64Decode = (text: string): string => {
    const encodedWord = crypto.enc.Base64.parse(text);
    return crypto.enc.Utf8.stringify(encodedWord);
};

export { base64Decode, base64Encrypt, decrypt, encrypt };
