/**
 * Temporary Credentials Generator
 * Creates secure temporary usernames and passwords for new organizations
 */

import { randomBytes } from 'crypto';

/**
 * Generate a unique temporary username for an organization
 * Format: org-{randomHex}
 */
export function generateTempUsername(): string {
  const randomHex = randomBytes(4).toString('hex'); // 8 characters
  return `org-${randomHex}`;
}

/**
 * Generate a secure temporary password
 * Format: Mix of uppercase, lowercase, numbers, and special characters
 */
export function generateTempPassword(): string {
  const length = 12;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = '';
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Generate a credentials expiration date (7 days from now)
 */
export function generateCredentialsExpiration(): Date {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7); // 7 days
  return expirationDate;
}

/**
 * Check if credentials have expired
 */
export function areCredentialsExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true;
  return new Date() > new Date(expiresAt);
}

/**
 * Check if credentials have been used
 */
export function areCredentialsUsed(usedAt: Date | null): boolean {
  return usedAt !== null;
}
