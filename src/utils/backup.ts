/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppState, Transaction } from '../types';
import { encryptData, decryptData } from './crypto';

// Export transactions to CSV formatted specifically for Excel (with UTF-8 BOM for Bangla characters)
export function exportToCSV(transactions: Transaction[], language: 'bn' | 'en', currency: string) {
  const headers = language === 'bn' 
    ? ['ID', 'ধরন', 'টাকার পরিমাণ', 'ক্যাটাগরি', 'তারিখ', 'বিবরণ', 'তৈরির সময়']
    : ['ID', 'Type', `Amount (${currency})`, 'Category', 'Date', 'Description', 'Created At'];

  const rows = transactions.map(t => [
    t.id,
    t.type === 'income' ? (language === 'bn' ? 'আয়' : 'Income') : (language === 'bn' ? 'ব্যয়' : 'Expense'),
    t.amount.toString(),
    t.category,
    t.date,
    t.description || '',
    new Date(t.createdAt).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  // Excel needs the UTF-8 BOM (\uFEFF) to display Bangla letters correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `amar_hisab_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export encrypted backup file
export async function exportEncryptedBackup(state: AppState, password?: string): Promise<string> {
  const serialized = JSON.stringify(state);
  
  if (password) {
    const encrypted = await encryptData(serialized, password);
    return JSON.stringify({
      version: '1.0',
      encrypted: true,
      ...encrypted
    });
  } else {
    return JSON.stringify({
      version: '1.0',
      encrypted: false,
      payload: serialized
    });
  }
}

// Import backup file (checks if encrypted, prompts password if so)
export async function importBackupFile(fileContent: string, password?: string): Promise<AppState> {
  const parsed = JSON.parse(fileContent);
  
  if (parsed.encrypted) {
    if (!password) {
      throw new Error('PASSWORD_REQUIRED');
    }
    try {
      const decrypted = await decryptData(parsed.ciphertext, password, parsed.iv, parsed.salt);
      return JSON.parse(decrypted) as AppState;
    } catch (err) {
      throw new Error('INVALID_PASSWORD');
    }
  } else {
    return JSON.parse(parsed.payload) as AppState;
  }
}
