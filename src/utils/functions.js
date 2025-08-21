import CryptoJS from 'crypto-js'; // Import CryptoJS

const SECRET_KEY = 'your_secret_key'; // Change this to a strong key

export const generateReferenceId = () => {
  return Array(32)
    .fill(0)
    .map(() => '12345abcde'[Math.floor(Math.random() * 10)])
    .join('');
};

export const encryptData = data => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

export const decryptData = encryptedData => {
  try {
    const bytes = CryptoJS.AES.decrypt(decodeURIComponent(encryptedData), SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error('Failed to decrypt user data:', error);
    return null;
  }
};

export const clearLocalStorageAfterDelay = (delay = 5000) => {
  setTimeout(() => {
    // Preserve user data
    const userData = localStorage.getItem('user');

    // Clear all localStorage
    localStorage.clear();

    // Restore user data if it exists
    if (userData) {
      localStorage.setItem('user', userData);
    }
  }, delay);
};
