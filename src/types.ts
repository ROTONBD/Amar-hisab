/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  description: string;
  subscriberId?: string; // Optional link to subscriber
  createdAt: string;
}

export interface Category {
  id: string;
  name?: string; // Bengali or English name
  name_bn?: string;
  name_en?: string;
  type: 'income' | 'expense';
  icon: string; // Lucide icon name
  color: string; // Hex color code or Tailwind class
}

export interface Settings {
  language: 'bn' | 'en';
  currency: '৳' | '$' | '₹' | '€';
  theme: 'emerald' | 'indigo' | 'amber' | 'rose' | 'slate';
  darkMode: boolean;
  autoBackup: boolean;
  backupInterval: 'daily' | 'weekly';
  lastBackup: string | null;
}

export interface Security {
  passwordLocked: boolean;
  passwordHash: string | null; // Hex of SHA-256 hash to verify lock
  salt: string | null; // Salt used for hashing/encryption
  hint: string;
}

export interface SyncConfig {
  syncKey: string | null;
  lastSynced: string | null;
  autoSync: boolean;
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  salt: string;
  updatedAt: string;
}

export interface Subscriber {
  id: string;
  name: string;
  mobile: string;
  packageName: string; // e.g. 5 Mbps, 10 Mbps, 20 Mbps, Hotspot
  monthlyBill: number; // monthly fee amount
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
}

export interface SMSTemplate {
  id: string;
  title: string;
  body: string;
  type: 'payment' | 'due' | 'welcome' | 'custom';
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  settings: Settings;
  security: Security;
  syncConfig: SyncConfig;
  subscribers?: Subscriber[];
  smsTemplates?: SMSTemplate[];
}
