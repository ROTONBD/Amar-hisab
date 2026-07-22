/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Helper to convert ArrayBuffer to Hex string
function bufToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper to convert Hex string to Uint8Array
function hexToBuf(hex: string): Uint8Array {
  const view = new Uint8Array(hex.length / 2);
  for (let i = 0; i < view.length; i++) {
    view[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return view;
}

// Helper to convert ArrayBuffer to Base64 string
function bufToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to convert Base64 string to Uint8Array
function base64ToBuf(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Hash a string using SHA-256 (for simple lock checks)
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufToHex(hashBuffer);
}

// Generate random cryptographic salt or IV
export function generateSalt(length: number = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return bufToHex(array.buffer);
}

// Encrypt plain text using a password (E2EE) with AES-GCM 256
export async function encryptData(text: string, password: string, providedSalt?: string): Promise<{ ciphertext: string; iv: string; salt: string }> {
  const encoder = new TextEncoder();
  const pwBytes = encoder.encode(password);
  
  // Use provided salt or generate a new one
  const saltHex = providedSalt || generateSalt(16);
  const saltBytes = hexToBuf(saltHex);
  
  // 1. Import raw password as key
  const baseKey = await crypto.subtle.importKey(
    'raw',
    pwBytes,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  // 2. Derive AES-GCM 256 key from password and salt
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  
  // 3. Generate random 12-byte IV (Initialization Vector)
  const ivBytes = new Uint8Array(12);
  crypto.getRandomValues(ivBytes);
  const ivHex = bufToHex(ivBytes.buffer);
  
  // 4. Encrypt data
  const dataBytes = encoder.encode(text);
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: ivBytes
    },
    key,
    dataBytes
  );
  
  return {
    ciphertext: bufToBase64(encryptedBuffer),
    iv: ivHex,
    salt: saltHex
  };
}

// Decrypt ciphertext using password with AES-GCM 256
export async function decryptData(ciphertext: string, password: string, ivHex: string, saltHex: string): Promise<string> {
  const encoder = new TextEncoder();
  const pwBytes = encoder.encode(password);
  const saltBytes = hexToBuf(saltHex);
  const ivBytes = hexToBuf(ivHex);
  const cipherBytes = base64ToBuf(ciphertext);
  
  // 1. Import raw password as key
  const baseKey = await crypto.subtle.importKey(
    'raw',
    pwBytes,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  // 2. Derive AES-GCM 256 key
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  
  // 3. Decrypt data
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBytes
    },
    key,
    cipherBytes
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}
