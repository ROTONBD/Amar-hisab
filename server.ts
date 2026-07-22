/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const STORE_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(STORE_DIR, 'sync-store.json');

// Ensure storage directory exists
if (!fs.existsSync(STORE_DIR)) {
  fs.mkdirSync(STORE_DIR, { recursive: true });
}

// In-memory cache loaded from file
let syncStore: Record<string, {
  ciphertext: string;
  iv: string;
  salt: string;
  updatedAt: string;
}> = {};

if (fs.existsSync(STORE_FILE)) {
  try {
    const rawData = fs.readFileSync(STORE_FILE, 'utf8');
    syncStore = JSON.parse(rawData);
    console.log('Loaded sync store with', Object.keys(syncStore).length, 'keys');
  } catch (err) {
    console.error('Error reading sync store file:', err);
  }
}

function saveStore() {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(syncStore, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving sync store to file:', err);
  }
}

// Enable JSON parser with large payload limit
app.use(express.json({ limit: '10mb' }));

// API endpoints
// 1. Get sync payload
app.get('/api/sync/:key', (req, res) => {
  const { key } = req.params;
  if (!key) {
    res.status(400).json({ error: 'Sync key is required' });
    return;
  }
  
  const payload = syncStore[key];
  if (!payload) {
    res.status(404).json({ error: 'Sync key not found' });
    return;
  }
  
  res.json(payload);
});

// 2. Upload sync payload (encrypted, E2EE)
app.post('/api/sync/:key', (req, res) => {
  const { key } = req.params;
  const { ciphertext, iv, salt, updatedAt } = req.body;
  
  if (!key) {
    res.status(400).json({ error: 'Sync key is required' });
    return;
  }
  if (!ciphertext || !iv || !salt) {
    res.status(400).json({ error: 'Ciphertext, IV, and Salt are required for secure E2EE backup' });
    return;
  }
  
  syncStore[key] = {
    ciphertext,
    iv,
    salt,
    updatedAt: updatedAt || new Date().toISOString()
  };
  
  saveStore();
  res.json({ success: true, key, updatedAt: syncStore[key].updatedAt });
});

// Dev vs Prod Asset Delivery Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
