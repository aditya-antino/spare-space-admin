import CryptoJS from 'crypto-js';

const getEncryptionKey = (): string => {
    const key = import.meta.env.VITE_PUBLIC_ENCRYPTION_KEY;
    if (!key) {
        if (import.meta.env.MODE === 'production') {
            throw new Error('VITE_PUBLIC_ENCRYPTION_KEY is required');
        }
        return 'default-encryption-key-change-in-production';
    }
    return key;
};

/**
 * EVP_BytesToKey key derivation function (OpenSSL compatible)
 * Derives key and IV from password and salt using MD5
 * 
 * @param password - Encryption key/password
 * @param salt - Random salt bytes
 * @param keyLen - Key length (32 for AES-256)
 * @param ivLen - IV length (16 for AES)
 * @returns Object with key and iv
 */
const evpBytesToKey = (
    password: CryptoJS.lib.WordArray,
    salt: CryptoJS.lib.WordArray,
    keyLen: number,
    ivLen: number,
): { key: CryptoJS.lib.WordArray; iv: CryptoJS.lib.WordArray } => {
    let data = CryptoJS.lib.WordArray.create();
    let key = CryptoJS.lib.WordArray.create();
    while (key.sigBytes < (keyLen + ivLen) * 4) {
        const hash = CryptoJS.MD5(data.concat(password).concat(salt));
        data = hash;
        key = key.concat(hash);
    }
    const keyWords = key.words.slice(0, keyLen / 4);
    const ivWords = key.words.slice(keyLen / 4, (keyLen + ivLen) / 4);
    return {
        key: CryptoJS.lib.WordArray.create(keyWords, keyLen),
        iv: CryptoJS.lib.WordArray.create(ivWords, ivLen),
    };
};

/**
 * Encrypts data using AES-256-CBC encryption with OpenSSL-compatible format
 * Matches backend implementation: OpenSSL "Salted__" format with EVP_BytesToKey
 * 
 * @param data - Data to encrypt (object, string, etc.)
 * @returns Encrypted string in OpenSSL salted format (Base64)
 */
export const encrypt = (data: any): string => {
    try {
        const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
        // Get encryption key
        const password = CryptoJS.enc.Utf8.parse(getEncryptionKey());
        // Generate random 8-byte salt
        const salt = CryptoJS.lib.WordArray.random(8);
        // Derive key and IV using EVP_BytesToKey (OpenSSL compatible)
        const { key, iv } = evpBytesToKey(password, salt, 32, 16);
        // Encrypt using AES-256-CBC
        const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        // Create OpenSSL salted format: "Salted__" + salt + encrypted data
        const saltedPrefix = CryptoJS.enc.Utf8.parse('Salted__');
        const combined = saltedPrefix.concat(salt).concat(encrypted.ciphertext);
        // Return as Base64 string
        return combined.toString(CryptoJS.enc.Base64);
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
};

/**
 * Decrypts data that was encrypted using OpenSSL salted format
 * Matches backend implementation: Parses "Salted__" format and uses EVP_BytesToKey
 * 
 * @param encryptedData - Encrypted string in OpenSSL salted format (Base64)
 * @returns Decrypted data (parsed as JSON if possible, otherwise string)
 */
export const decrypt = (encryptedData: string): any => {
    try {
        if (!encryptedData || typeof encryptedData !== 'string') {
            throw new Error('Invalid encrypted data');
        }
        // Parse Base64 encrypted data
        const encrypted = CryptoJS.enc.Base64.parse(encryptedData);
        // Extract "Salted__" prefix (8 bytes = 2 words)
        const saltedPrefix = CryptoJS.lib.WordArray.create(encrypted.words.slice(0, 2));
        const prefixString = saltedPrefix.toString(CryptoJS.enc.Utf8);
        if (prefixString !== 'Salted__') {
            throw new Error('Invalid encrypted data format: missing "Salted__" prefix');
        }
        // Extract salt (next 8 bytes = 2 words) and ciphertext (rest)
        const salt = CryptoJS.lib.WordArray.create(encrypted.words.slice(2, 4));
        const ciphertext = CryptoJS.lib.WordArray.create(encrypted.words.slice(4));
        // Get encryption key
        const password = CryptoJS.enc.Utf8.parse(getEncryptionKey());
        // Derive key and IV using EVP_BytesToKey (same as encryption)
        const { key, iv } = evpBytesToKey(password, salt, 32, 16);
        // Decrypt using AES-256-CBC
        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: ciphertext } as any,
            key,
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
            }
        );
        // Convert to UTF-8 string
        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
        if (!decryptedString) {
            throw new Error('Decryption resulted in empty string - invalid key or corrupted data');
        }
        // Try to parse as JSON, if it fails return as string
        try {
            return JSON.parse(decryptedString);
        } catch {
            return decryptedString;
        }
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
};

/**
 * Checks if data is encrypted (has the OpenSSL salted format)
 * Validates Base64 format and "Salted__" prefix
 * 
 * @param data - Data to check
 * @returns boolean
 */
export const isEncrypted = (data: any): boolean => {
    if (typeof data !== 'string' || !data) return false;
    try {
        // Check if it's valid Base64
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Regex.test(data)) return false;
        // Parse and check for "Salted__" prefix
        const decoded = CryptoJS.enc.Base64.parse(data);
        // Minimum length: "Salted__" (8 bytes) + salt (8 bytes) + some ciphertext
        if (decoded.words.length < 4) return false; // At least 2 words for "Salted__"
        // Check prefix
        const prefix = CryptoJS.lib.WordArray.create(decoded.words.slice(0, 2));
        const prefixString = prefix.toString(CryptoJS.enc.Utf8);
        return prefixString === 'Salted__';
    } catch {
        return false;
    }
};

/**
 * Encrypts request payload
 * Matches backend format: { encryptedData: "openssl-salted-base64-string" }
 * 
 * @param data - Request data
 * @returns Encrypted data in format { encryptedData: "..." } (matches backend)
 */
export const encryptRequest = (data: any): any => {
    if (!data) return data;
    // Don't encrypt FormData, Blob, or ArrayBuffer (file uploads)
    if (data instanceof FormData || data instanceof Blob || data instanceof ArrayBuffer) {
        return data;
    }
    // Don't encrypt if data is already encrypted (avoid double encryption)
    if (data.encryptedData && typeof data.encryptedData === 'string' && isEncrypted(data.encryptedData)) {
        return data;
    }
    // Don't encrypt empty objects
    if (typeof data === 'object' && Object.keys(data).length === 0) {
        return data;
    }
    try {
        // Encrypt the data using OpenSSL salted format
        const encrypted = encrypt(data);
        // Return as object with encryptedData field (matches backend format)
        // Backend expects: { encryptedData: "openssl-salted-base64-string" }
        return {
            encryptedData: encrypted,
        };
    } catch (error) {
        console.error('Request encryption failed:', error);
        throw error;
    }
};

/**
 * Decrypts response data
 * Handles response format from the API: { encryptedData: "openssl-salted-base64-string" }
 * Matches backend format - backend returns { encryptedData: "..." } and we decrypt it
 * 
 * @param data - Response data from API
 * @returns Decrypted data
 */
export const decryptResponse = (data: any): any => {
    if (!data) {
        return data;
    }
    const encryptedString = data.encryptData || data.encryptedData;
    
    if (encryptedString && typeof encryptedString === 'string') {
        try {
            const decrypted = decrypt(encryptedString);
            return decrypted;
        } catch (error) {
            console.error('Failed to decrypt response:', error);
            return data;
        }
    }
    if (typeof data === 'string' && isEncrypted(data)) {
        try {
            return decrypt(data);
        } catch (error) {
            console.error('Failed to decrypt string response:', error);
            return data;
        }
    }
    return data;
};

