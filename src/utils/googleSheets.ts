/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppState, Category, SMSTemplate, Subscriber, Transaction, Settings } from '../types';

export const SHEET_NAME = 'আমার হিসাব - ডাটাবেস';

export interface SheetsSyncResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

/**
 * Searches Google Drive for an existing spreadsheet or creates a new one
 */
export async function getOrCreateDatabaseSheet(accessToken: string): Promise<SheetsSyncResult> {
  // 1. Search Drive for existing spreadsheet
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    `name = '${SHEET_NAME}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`
  )}`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchRes.ok) {
    const errText = await searchRes.text();
    throw new Error(`Failed to search Google Drive: ${errText}`);
  }

  const searchData = await searchRes.json();

  if (searchData.files && searchData.files.length > 0) {
    const existingFile = searchData.files[0];
    return {
      spreadsheetId: existingFile.id,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${existingFile.id}/edit`,
    };
  }

  // 2. Create new spreadsheet if not exists
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title: SHEET_NAME },
      sheets: [
        { properties: { title: 'Transactions' } },
        { properties: { title: 'Subscribers' } },
        { properties: { title: 'Categories' } },
        { properties: { title: 'Settings' } },
        { properties: { title: 'SMS_Templates' } },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Sheet: ${errText}`);
  }

  const newSheetData = await createRes.json();
  const spreadsheetId = newSheetData.spreadsheetId;

  // Set header rows
  await initializeSheetHeaders(accessToken, spreadsheetId);

  return {
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}

/**
 * Initialize headers for each worksheet tab
 */
async function initializeSheetHeaders(accessToken: string, spreadsheetId: string) {
  const data = [
    {
      range: 'Transactions!A1:H1',
      values: [['ID', 'Type', 'Amount', 'Category', 'Date', 'Description', 'SubscriberID', 'CreatedAt']],
    },
    {
      range: 'Subscribers!A1:H1',
      values: [['ID', 'Name', 'Mobile', 'PackageName', 'MonthlyBill', 'Status', 'Notes', 'CreatedAt']],
    },
    {
      range: 'Categories!A1:F1',
      values: [['ID', 'NameBN', 'NameEN', 'Type', 'Icon', 'Color']],
    },
    {
      range: 'Settings!A1:B1',
      values: [['Key', 'Value']],
    },
    {
      range: 'SMS_Templates!A1:E1',
      values: [['ID', 'Title', 'Body', 'Type']],
    },
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data,
    }),
  });
}

/**
 * Fetch all data from Google Sheets and build AppState
 */
export async function fetchAppStateFromSheets(accessToken: string, spreadsheetId: string): Promise<Partial<AppState>> {
  const ranges = [
    'Transactions!A2:H1000',
    'Subscribers!A2:H1000',
    'Categories!A2:F1000',
    'Settings!A2:B100',
    'SMS_Templates!A2:E100',
  ];

  const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${ranges
    .map((r) => `ranges=${encodeURIComponent(r)}`)
    .join('&')}`;

  const res = await fetch(batchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch values from Google Sheets`);
  }

  const data = await res.json();
  const valueRanges = data.valueRanges || [];

  const transactionsRaw = valueRanges[0]?.values || [];
  const subscribersRaw = valueRanges[1]?.values || [];
  const categoriesRaw = valueRanges[2]?.values || [];
  const settingsRaw = valueRanges[3]?.values || [];
  const smsTemplatesRaw = valueRanges[4]?.values || [];

  // Parse Transactions
  const transactions: Transaction[] = transactionsRaw.map((row: any[]) => ({
    id: row[0] || '',
    type: (row[1] as 'income' | 'expense') || 'income',
    amount: parseFloat(row[2]) || 0,
    category: row[3] || '',
    date: row[4] || new Date().toISOString().slice(0, 10),
    description: row[5] || '',
    subscriberId: row[6] || undefined,
    createdAt: row[7] || new Date().toISOString(),
  }));

  // Parse Subscribers
  const subscribers: Subscriber[] = subscribersRaw.map((row: any[]) => ({
    id: row[0] || '',
    name: row[1] || '',
    mobile: row[2] || '',
    packageName: row[3] || '',
    monthlyBill: parseFloat(row[4]) || 0,
    status: (row[5] as 'active' | 'inactive') || 'active',
    notes: row[6] || '',
    createdAt: row[7] || new Date().toISOString(),
  }));

  // Parse Categories
  const categories: Category[] = categoriesRaw.map((row: any[]) => ({
    id: row[0] || '',
    name_bn: row[1] || '',
    name_en: row[2] || '',
    type: (row[3] as 'income' | 'expense') || 'income',
    icon: row[4] || 'Tag',
    color: row[5] || '#10b981',
  }));

  // Parse Settings
  const settingsObj: Record<string, any> = {};
  settingsRaw.forEach((row: any[]) => {
    if (row[0]) {
      try {
        settingsObj[row[0]] = JSON.parse(row[1]);
      } catch {
        settingsObj[row[0]] = row[1];
      }
    }
  });

  // Parse SMS Templates
  const smsTemplates: SMSTemplate[] = smsTemplatesRaw.map((row: any[]) => ({
    id: row[0] || '',
    title: row[1] || '',
    body: row[2] || '',
    type: (row[3] as any) || 'custom',
  }));

  const partialState: Partial<AppState> = {};

  if (transactions.length > 0) partialState.transactions = transactions;
  if (subscribers.length > 0) partialState.subscribers = subscribers;
  if (categories.length > 0) partialState.categories = categories;
  if (smsTemplates.length > 0) partialState.smsTemplates = smsTemplates;
  if (Object.keys(settingsObj).length > 0) {
    partialState.settings = {
      language: settingsObj.language || 'bn',
      currency: settingsObj.currency || '৳',
      theme: settingsObj.theme || 'emerald',
      darkMode: !!settingsObj.darkMode,
      autoBackup: settingsObj.autoBackup ?? true,
      backupInterval: settingsObj.backupInterval || 'daily',
      lastBackup: settingsObj.lastBackup || null,
    };
  }

  return partialState;
}

/**
 * Save current state to Google Sheets
 */
export async function saveAppStateToSheets(
  accessToken: string,
  spreadsheetId: string,
  state: AppState
): Promise<void> {
  // Clear existing values in sheet tabs first, then write updated rows
  const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`;
  await fetch(clearUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ranges: [
        'Transactions!A2:H1000',
        'Subscribers!A2:H1000',
        'Categories!A2:F1000',
        'Settings!A2:B100',
        'SMS_Templates!A2:E100',
      ],
    }),
  });

  // Prepare updated rows
  const transactionsRows = state.transactions.map((t) => [
    t.id,
    t.type,
    t.amount,
    t.category,
    t.date,
    t.description || '',
    t.subscriberId || '',
    t.createdAt,
  ]);

  const subscribersRows = (state.subscribers || []).map((s) => [
    s.id,
    s.name,
    s.mobile,
    s.packageName,
    s.monthlyBill,
    s.status,
    s.notes || '',
    s.createdAt,
  ]);

  const categoriesRows = state.categories.map((c) => [
    c.id,
    c.name_bn || c.name || '',
    c.name_en || c.name || '',
    c.type,
    c.icon,
    c.color,
  ]);

  const settingsRows = [
    ['language', JSON.stringify(state.settings.language)],
    ['currency', JSON.stringify(state.settings.currency)],
    ['theme', JSON.stringify(state.settings.theme)],
    ['darkMode', JSON.stringify(state.settings.darkMode)],
    ['autoBackup', JSON.stringify(state.settings.autoBackup)],
    ['backupInterval', JSON.stringify(state.settings.backupInterval)],
    ['lastBackup', JSON.stringify(state.settings.lastBackup)],
  ];

  const smsTemplatesRows = (state.smsTemplates || []).map((st) => [
    st.id,
    st.title,
    st.body,
    st.type,
  ]);

  const updateData = [
    {
      range: `Transactions!A2:H${transactionsRows.length + 1}`,
      values: transactionsRows,
    },
    {
      range: `Subscribers!A2:H${subscribersRows.length + 1}`,
      values: subscribersRows,
    },
    {
      range: `Categories!A2:F${categoriesRows.length + 1}`,
      values: categoriesRows,
    },
    {
      range: `Settings!A2:B${settingsRows.length + 1}`,
      values: settingsRows,
    },
    {
      range: `SMS_Templates!A2:E${smsTemplatesRows.length + 1}`,
      values: smsTemplatesRows,
    },
  ].filter((d) => d.values.length > 0);

  if (updateData.length > 0) {
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
    const updateRes = await fetch(updateUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: updateData,
      }),
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      console.error('Failed to update Google Sheets:', errText);
    }
  }
}
