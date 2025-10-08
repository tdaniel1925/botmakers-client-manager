import crypto from "crypto";

const ENCRYPTION_KEY = process.env.CREDENTIALS_ENCRYPTION_KEY;
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts sensitive credential data using AES-256-GCM
 * @param text - The plaintext credential to encrypt
 * @returns Encrypted string in format: iv:authTag:encryptedData (all hex)
 */
export function encryptCredential(text: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error(
      "CREDENTIALS_ENCRYPTION_KEY environment variable is not set. " +
        "Generate one using: openssl rand -hex 32"
    );
  }

  if (ENCRYPTION_KEY.length !== 64) {
    throw new Error(
      "CREDENTIALS_ENCRYPTION_KEY must be 64 hex characters (32 bytes). " +
        "Generate one using: openssl rand -hex 32"
    );
  }

  if (!text) {
    throw new Error("Cannot encrypt empty text");
  }

  // Convert hex key to buffer
  const key = Buffer.from(ENCRYPTION_KEY, "hex");

  // Generate random IV
  const iv = crypto.randomBytes(IV_LENGTH);

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt the text
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Get auth tag
  const authTag = cipher.getAuthTag();

  // Combine iv:authTag:encrypted (all in hex)
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts credential data encrypted with encryptCredential
 * @param encryptedText - Encrypted string in format: iv:authTag:encryptedData (all hex)
 * @returns Decrypted plaintext credential
 */
export function decryptCredential(encryptedText: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error(
      "CREDENTIALS_ENCRYPTION_KEY environment variable is not set. " +
        "Generate one using: openssl rand -hex 32"
    );
  }

  if (ENCRYPTION_KEY.length !== 64) {
    throw new Error(
      "CREDENTIALS_ENCRYPTION_KEY must be 64 hex characters (32 bytes). " +
        "Generate one using: openssl rand -hex 32"
    );
  }

  if (!encryptedText) {
    throw new Error("Cannot decrypt empty text");
  }

  try {
    // Split the encrypted text
    const parts = encryptedText.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted text format");
    }

    const [ivHex, authTagHex, encryptedHex] = parts;

    // Convert hex strings back to buffers
    const key = Buffer.from(ENCRYPTION_KEY, "hex");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    throw new Error(
      `Failed to decrypt credential: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Masks a credential for display purposes
 * Shows first 4 and last 4 characters, masks the rest
 */
export function maskCredential(credential: string, visibleChars: number = 4): string {
  if (!credential || credential.length <= visibleChars * 2) {
    return credential;
  }

  const start = credential.substring(0, visibleChars);
  const end = credential.substring(credential.length - visibleChars);
  const maskLength = credential.length - visibleChars * 2;

  return `${start}${"*".repeat(Math.min(maskLength, 12))}${end}`;
}

