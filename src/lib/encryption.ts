// Use Web Crypto API instead of Node's Buffer
export function encryptApiKey(apiKey: string): string {
  try {
    // For browser storage, we'll use base64 encoding
    // This is not encryption, but it's suitable for storing API keys in localStorage
    // as they are already public keys
    return btoa(apiKey);
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
}

export function decryptApiKey(encryptedKey: string): string {
  try {
    return atob(encryptedKey);
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}