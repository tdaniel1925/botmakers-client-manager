/**
 * Email Encryption Utilities
 * AES-256-GCM encryption for securing email credentials (IMAP/SMTP passwords, OAuth tokens)
 */

import crypto from 'crypto';

// Algorithm configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128-bit IV for GCM mode
const AUTH_TAG_LENGTH = 16; // 128-bit auth tag
const SALT_LENGTH = 32; // 256-bit salt for key derivation

/**
 * Get encryption key from environment variable
 * Should be a 32-byte (256-bit) key in hex format
 */
function getEncryptionKey(): Buffer {
  const key = process.env.EMAIL_ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('EMAIL_ENCRYPTION_KEY environment variable is not set');
  }
  
  // Convert hex string to buffer
  const keyBuffer = Buffer.from(key, 'hex');
  
  if (keyBuffer.length !== 32) {
    throw new Error('EMAIL_ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
  }
  
  return keyBuffer;
}

/**
 * Derive a user-specific encryption key from the master key
 * This ensures each user's data is encrypted with a unique key
 */
function deriveUserKey(userId: string, salt: Buffer): Buffer {
  const masterKey = getEncryptionKey();
  
  // Use PBKDF2 to derive a user-specific key
  return crypto.pbkdf2Sync(
    masterKey,
    Buffer.concat([Buffer.from(userId, 'utf8'), salt]),
    100000, // iterations
    32, // key length
    'sha256'
  );
}

/**
 * Generate a cryptographically secure random salt
 */
function generateSalt(): Buffer {
  return crypto.randomBytes(SALT_LENGTH);
}

/**
 * Encrypt sensitive data (passwords, tokens)
 * Returns base64-encoded string: salt:iv:authTag:encryptedData
 */
export function encrypt(plaintext: string, userId: string): string {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty string');
  }
  
  try {
    // Generate salt and derive user-specific key
    const salt = generateSalt();
    const key = deriveUserKey(userId, salt);
    
    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final()
    ]);
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    // Combine: salt:iv:authTag:encrypted
    const combined = Buffer.concat([salt, iv, authTag, encrypted]);
    
    // Return as base64
    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 * Expects base64-encoded string: salt:iv:authTag:encryptedData
 */
export function decrypt(encrypted: string, userId: string): string {
  if (!encrypted) {
    throw new Error('Cannot decrypt empty string');
  }
  
  try {
    // Decode from base64
    const combined = Buffer.from(encrypted, 'base64');
    
    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH);
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
    const encryptedData = combined.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
    
    // Derive user-specific key
    const key = deriveUserKey(userId, salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data - data may be corrupted or tampered with');
  }
}

/**
 * Generate a secure random encryption key (for initial setup)
 * Use this to generate EMAIL_ENCRYPTION_KEY for your .env file
 * 
 * @returns 32-byte key as hex string (64 characters)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Securely compare two strings in constant time
 * Prevents timing attacks when comparing sensitive data
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(
    Buffer.from(a, 'utf8'),
    Buffer.from(b, 'utf8')
  );
}

/**
 * Hash sensitive data for storage (one-way)
 * Useful for storing hashed versions of tokens for verification
 */
export function hashData(data: string): string {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
}

/**
 * Test encryption/decryption with sample data
 * Used for validating encryption key on startup
 */
export function testEncryption(userId: string = 'test-user'): boolean {
  try {
    const testData = 'test-password-123';
    const encrypted = encrypt(testData, userId);
    const decrypted = decrypt(encrypted, userId);
    
    return testData === decrypted;
  } catch (error) {
    console.error('Encryption test failed:', error);
    return false;
  }
}

/**
 * Sanitize sensitive data from logs
 * Replaces sensitive fields with [REDACTED]
 */
export function sanitizeForLogging(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const sensitiveFields = [
    'password',
    'imapPassword',
    'smtpPassword',
    'accessToken',
    'refreshToken',
    'token',
    'secret',
    'apiKey'
  ];
  
  const sanitized: any = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitized[key] = sanitizeForLogging(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }
  
  return sanitized;
}

/**
 * Rotate encryption key for a user
 * Re-encrypts all data with a new key derivation
 * This should be called periodically or after security events
 */
export function rotateUserKey(
  encryptedData: string[],
  userId: string,
  oldUserId?: string
): string[] {
  const userIdToUse = oldUserId || userId;
  
  return encryptedData.map(data => {
    // Decrypt with old key
    const decrypted = decrypt(data, userIdToUse);
    // Re-encrypt with new key
    return encrypt(decrypted, userId);
  });
}

