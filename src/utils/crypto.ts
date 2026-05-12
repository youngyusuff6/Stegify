import CryptoJS from 'crypto-js';

export function encryptData(data: string, password: string): string {
  return CryptoJS.AES.encrypt(data, password).toString();
}

export function decryptData(ciphertext: string, password: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, password);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  if (!decrypted) throw new Error('Decryption failed — wrong password');
  return decrypted;
}
