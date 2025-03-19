const STORAGE_PREFIX = 'encrypted_api_key_';

export function encryptApiKey(apiKey: string, modelId: string): void {
  try {
    // Simple encryption for demo (in production, use proper encryption)
    const encrypted = btoa(apiKey);
    localStorage.setItem(`${STORAGE_PREFIX}${modelId}`, encrypted);
  } catch (error) {
    console.error('Error encrypting API key:', error);
  }
}

export function decryptApiKey(modelId: string): string | null {
  try {
    const encrypted = localStorage.getItem(`${STORAGE_PREFIX}${modelId}`);
    if (!encrypted) return null;
    // Simple decryption for demo (in production, use proper decryption)
    return atob(encrypted);
  } catch (error) {
    console.error('Error decrypting API key:', error);
    return null;
  }
}

export function getDecryptedApiKey(modelId: string): string | null {
  return decryptApiKey(modelId);
}

export function removeApiKey(modelId: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${modelId}`);
}
