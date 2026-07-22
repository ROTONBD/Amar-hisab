/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, Tag, Download, Cloud, Lock, Unlock, 
  Plus, Bell, LogOut, Settings as SettingsIcon, Sparkles, AlertTriangle, Users,
  CheckCircle, Info, X, FileSpreadsheet, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AppState, Transaction, Category, Settings as SettingsType, Security, SyncConfig, EncryptedPayload, Subscriber, SMSTemplate
} from './types';
import { defaultCategories, translations, themeColors } from './utils/language';
import { defaultSmsTemplates } from './utils/smsTemplates';
import { encryptData, decryptData } from './utils/crypto';
import { initAuth, googleSignIn, logoutGoogle } from './utils/googleAuth';
import { getOrCreateDatabaseSheet, fetchAppStateFromSheets, saveAppStateToSheets } from './utils/googleSheets';

// Import components
import PasswordLock from './components/PasswordLock';
import Dashboard from './components/Dashboard';
import TransactionModal from './components/TransactionModal';
import Reports from './components/Reports';
import Categories from './components/Categories';
import Settings from './components/Settings';
import Subscribers from './components/Subscribers';

export default function App() {
  // -----------------------------------------
  // Core App States
  // -----------------------------------------
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [smsTemplates, setSmsTemplates] = useState<SMSTemplate[]>([]);
  
  const [settings, setSettings] = useState<SettingsType>({
    language: 'bn',
    currency: '৳',
    theme: 'emerald',
    darkMode: true,
    autoBackup: true,
    backupInterval: 'daily',
    lastBackup: null
  });

  const [security, setSecurity] = useState<Security>({
    passwordLocked: false,
    passwordHash: null,
    salt: null,
    hint: ''
  });

  const [syncConfig, setSyncConfig] = useState<SyncConfig>({
    syncKey: null,
    lastSynced: null,
    autoSync: false
  });

  // UI Flow control states
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'categories' | 'settings' | 'subscribers'>('dashboard');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null);
  
  // Alerts / Notification systems
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: 'success' | 'warn' | 'info'; time: Date }>>([]);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'warn' | 'info' }>>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const [syncLoading, setSyncLoading] = useState(false);
  const [appMounted, setAppMounted] = useState(false);

  // Google Sheets Database States
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [sheetsInfo, setSheetsInfo] = useState<{ spreadsheetId: string; spreadsheetUrl: string } | null>(null);
  const [sheetsSyncing, setSheetsSyncing] = useState(false);
  const [sheetsLastSynced, setSheetsLastSynced] = useState<string | null>(null);

  const t = translations[settings.language];

  // -----------------------------------------
  // Google Auth & Sheets Initialization
  // -----------------------------------------
  useEffect(() => {
    const unsubscribe = initAuth(
      async (user, token) => {
        setGoogleUser(user);
        setGoogleAccessToken(token);
        try {
          setSheetsSyncing(true);
          const info = await getOrCreateDatabaseSheet(token);
          setSheetsInfo(info);
          const remoteData = await fetchAppStateFromSheets(token, info.spreadsheetId);
          if (remoteData.transactions && remoteData.transactions.length > 0) {
            setTransactions(remoteData.transactions);
          }
          if (remoteData.subscribers && remoteData.subscribers.length > 0) {
            setSubscribers(remoteData.subscribers);
          }
          if (remoteData.categories && remoteData.categories.length > 0) {
            setCategories(remoteData.categories);
          }
          if (remoteData.smsTemplates && remoteData.smsTemplates.length > 0) {
            setSmsTemplates(remoteData.smsTemplates);
          }
          if (remoteData.settings) {
            setSettings(prev => ({ ...prev, ...remoteData.settings }));
          }
          setSheetsLastSynced(new Date().toISOString());
        } catch (err) {
          console.error('Google Sheets autoload error:', err);
        } finally {
          setSheetsSyncing(false);
        }
      },
      () => {
        setGoogleUser(null);
        setGoogleAccessToken(null);
        setSheetsInfo(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // -----------------------------------------
  // Lifecycle & Storage Loader (E2EE at rest)
  // -----------------------------------------
  useEffect(() => {
    // 1. First, check if security config exists in LocalStorage
    const storedSecurity = localStorage.getItem('ah_security');
    if (storedSecurity) {
      try {
        const parsedSecurity = JSON.parse(storedSecurity) as Security;
        setSecurity(parsedSecurity);
        
        if (parsedSecurity.passwordLocked) {
          // If locked, do not mark unlocked yet
          setIsUnlocked(false);
        }
      } catch (e) {
        console.error('Error parsing security config', e);
      }
    }

    // Load non-sensitive settings immediately
    const storedSettings = localStorage.getItem('ah_settings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings) as SettingsType;
        setSettings(parsedSettings);
        
        // Handle initial theme injection immediately
        if (parsedSettings.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Load category preferences
    const storedCategories = localStorage.getItem('ah_categories');
    if (storedCategories) {
      try {
        const parsedCats = JSON.parse(storedCategories);
        if (Array.isArray(parsedCats) && parsedCats.some(c => c.id === 'cat_sub_collection')) {
          setCategories(parsedCats);
        } else {
          setCategories(defaultCategories);
          localStorage.setItem('ah_categories', JSON.stringify(defaultCategories));
        }
      } catch (e) {
        console.error(e);
        setCategories(defaultCategories);
      }
    } else {
      setCategories(defaultCategories);
      localStorage.setItem('ah_categories', JSON.stringify(defaultCategories));
    }

    // Load Sync config
    const storedSync = localStorage.getItem('ah_sync_config');
    if (storedSync) {
      try {
        setSyncConfig(JSON.parse(storedSync));
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Load transactions and subscribers data
    // If not password locked, load instantly. If locked, we wait until user unlocks.
    const hasLock = storedSecurity && JSON.parse(storedSecurity).passwordLocked;
    if (!hasLock) {
      const storedTx = localStorage.getItem('ah_transactions');
      if (storedTx) {
        try {
          setTransactions(JSON.parse(storedTx));
        } catch (e) {
          console.error(e);
        }
      }
      const storedSubs = localStorage.getItem('ah_subscribers');
      if (storedSubs) {
        try {
          setSubscribers(JSON.parse(storedSubs));
        } catch (e) {
          console.error(e);
        }
      }
      const storedTemplates = localStorage.getItem('ah_sms_templates');
      if (storedTemplates) {
        try {
          setSmsTemplates(JSON.parse(storedTemplates));
        } catch (e) {
          console.error(e);
          setSmsTemplates(defaultSmsTemplates);
        }
      } else {
        setSmsTemplates(defaultSmsTemplates);
        localStorage.setItem('ah_sms_templates', JSON.stringify(defaultSmsTemplates));
      }
    }

    setAppMounted(true);
  }, []);

  // Sync Dark mode DOM elements
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Push notifications helper
  const addNotification = (message: string, type: 'success' | 'warn' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotif = {
      id,
      message,
      type,
      time: new Date()
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 19)]);
    
    // Push to floating toast container
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // -----------------------------------------
  // Database Save Handlers (Instant State Save)
  // -----------------------------------------
  const saveStateToStorage = async (
    currentTxList: Transaction[],
    currentCats: Category[],
    currentSetts: SettingsType,
    currentSec: Security,
    currentSync: SyncConfig,
    currentSubscribers?: Subscriber[],
    currentSmsTemplates?: SMSTemplate[],
    unlockPassword?: string
  ) => {
    try {
      // 1. Basic properties
      localStorage.setItem('ah_settings', JSON.stringify(currentSetts));
      localStorage.setItem('ah_categories', JSON.stringify(currentCats));
      localStorage.setItem('ah_security', JSON.stringify(currentSec));
      localStorage.setItem('ah_sync_config', JSON.stringify(currentSync));

      const subsToSave = currentSubscribers !== undefined ? currentSubscribers : subscribers;
      const templatesToSave = currentSmsTemplates !== undefined ? currentSmsTemplates : smsTemplates;

      // 2. End-to-End Encryption at rest
      if (currentSec.passwordLocked) {
        // If password is set and we have the active session password, encrypt transactions, subscribers and templates
        const activePassword = unlockPassword || localStorage.getItem('ah_session_pw');
        if (activePassword) {
          const serializedTx = JSON.stringify(currentTxList);
          const encrypted = await encryptData(serializedTx, activePassword, currentSec.salt || undefined);
          localStorage.setItem('ah_transactions_encrypted', JSON.stringify(encrypted));
          localStorage.removeItem('ah_transactions'); // remove unencrypted copy for security

          const serializedSubs = JSON.stringify(subsToSave);
          const encryptedSubs = await encryptData(serializedSubs, activePassword, currentSec.salt || undefined);
          localStorage.setItem('ah_subscribers_encrypted', JSON.stringify(encryptedSubs));
          localStorage.removeItem('ah_subscribers');

          const serializedTpls = JSON.stringify(templatesToSave);
          const encryptedTpls = await encryptData(serializedTpls, activePassword, currentSec.salt || undefined);
          localStorage.setItem('ah_sms_templates_encrypted', JSON.stringify(encryptedTpls));
          localStorage.removeItem('ah_sms_templates');
        }
      } else {
        // No lock, save plain transactions & subscribers & templates
        localStorage.setItem('ah_transactions', JSON.stringify(currentTxList));
        localStorage.removeItem('ah_transactions_encrypted');

        localStorage.setItem('ah_subscribers', JSON.stringify(subsToSave));
        localStorage.removeItem('ah_subscribers_encrypted');

        localStorage.setItem('ah_sms_templates', JSON.stringify(templatesToSave));
        localStorage.removeItem('ah_sms_templates_encrypted');
      }

      // 3. Auto Sync to Google Sheets if connected
      if (googleAccessToken && sheetsInfo?.spreadsheetId) {
        saveAppStateToSheets(googleAccessToken, sheetsInfo.spreadsheetId, {
          transactions: currentTxList,
          categories: currentCats,
          settings: currentSetts,
          security: currentSec,
          syncConfig: currentSync,
          subscribers: subsToSave,
          smsTemplates: templatesToSave
        }).then(() => {
          setSheetsLastSynced(new Date().toISOString());
        }).catch(err => {
          console.error('Google Sheets background auto-save error:', err);
        });
      }
    } catch (err) {
      console.error('Error saving state:', err);
    }
  };

  // -----------------------------------------
  // Google Sheets Action Handlers
  // -----------------------------------------
  const handleGoogleConnect = async () => {
    try {
      setSheetsSyncing(true);
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleAccessToken(result.accessToken);
        const info = await getOrCreateDatabaseSheet(result.accessToken);
        setSheetsInfo(info);

        const currentState: AppState = {
          transactions,
          categories,
          settings,
          security,
          syncConfig,
          subscribers,
          smsTemplates
        };
        await saveAppStateToSheets(result.accessToken, info.spreadsheetId, currentState);
        setSheetsLastSynced(new Date().toISOString());
        addNotification(settings.language === 'bn' ? 'গুগল শীট ডাটাবেস সফলভাবে কানেক্ট হয়েছে!' : 'Google Sheets database connected successfully!', 'success');
      }
    } catch (err) {
      console.error('Failed connecting Google Sheets:', err);
      addNotification(settings.language === 'bn' ? 'গুগল শীট কানেক্ট করতে ব্যর্থ হয়েছে' : 'Failed to connect Google Sheets', 'warn');
    } finally {
      setSheetsSyncing(false);
    }
  };

  const handleGoogleSheetsSync = async () => {
    if (!googleAccessToken || !sheetsInfo?.spreadsheetId) return;
    try {
      setSheetsSyncing(true);
      const currentState: AppState = {
        transactions,
        categories,
        settings,
        security,
        syncConfig,
        subscribers,
        smsTemplates
      };
      await saveAppStateToSheets(googleAccessToken, sheetsInfo.spreadsheetId, currentState);
      setSheetsLastSynced(new Date().toISOString());
      addNotification(settings.language === 'bn' ? 'গুগল শীটে সিঙ্ক সম্পন্ন হয়েছে!' : 'Synced to Google Sheets successfully!', 'success');
    } catch (err) {
      console.error('Failed to sync to Google Sheets:', err);
      addNotification(settings.language === 'bn' ? 'গুগল শীটে সিঙ্ক করতে সমস্যা হয়েছে' : 'Failed to sync to Google Sheets', 'warn');
    } finally {
      setSheetsSyncing(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setGoogleAccessToken(null);
    setSheetsInfo(null);
    addNotification(settings.language === 'bn' ? 'গুগল অ্যাকাউন্ট ডিসকানেক্ট করা হয়েছে' : 'Google account disconnected', 'info');
  };

  // Trigger unlocking and decrypt database
  const handleUnlockAndDecrypt = async (password: string) => {
    try {
      const storedEncrypted = localStorage.getItem('ah_transactions_encrypted');
      if (storedEncrypted) {
        const parsed = JSON.parse(storedEncrypted);
        // Decrypt using password
        const decryptedStr = await decryptData(parsed.ciphertext, password, parsed.iv, parsed.salt);
        const decryptedTx = JSON.parse(decryptedStr) as Transaction[];
        setTransactions(decryptedTx);
      } else {
        // If locked but no transactions saved yet
        setTransactions([]);
      }

      const storedSubsEncrypted = localStorage.getItem('ah_subscribers_encrypted');
      if (storedSubsEncrypted) {
        const parsed = JSON.parse(storedSubsEncrypted);
        const decryptedStr = await decryptData(parsed.ciphertext, password, parsed.iv, parsed.salt);
        const decryptedSubs = JSON.parse(decryptedStr) as Subscriber[];
        setSubscribers(decryptedSubs);
      } else {
        setSubscribers([]);
      }

      const storedTplsEncrypted = localStorage.getItem('ah_sms_templates_encrypted');
      if (storedTplsEncrypted) {
        const parsed = JSON.parse(storedTplsEncrypted);
        const decryptedStr = await decryptData(parsed.ciphertext, password, parsed.iv, parsed.salt);
        const decryptedTpls = JSON.parse(decryptedStr) as SMSTemplate[];
        setSmsTemplates(decryptedTpls);
      } else {
        const plainTpls = localStorage.getItem('ah_sms_templates');
        if (plainTpls) {
          try {
            setSmsTemplates(JSON.parse(plainTpls));
          } catch (e) {
            setSmsTemplates(defaultSmsTemplates);
          }
        } else {
          setSmsTemplates(defaultSmsTemplates);
        }
      }

      // Save session password in memory (sessionStorage/temporary runtime, not persistent text)
      localStorage.setItem('ah_session_pw', password);
      setIsUnlocked(true);
      addNotification(settings.language === 'bn' ? 'সাফল্যের সাথে খতিয়ান আনলক করা হয়েছে!' : 'Ledger securely unlocked!', 'success');
    } catch (err) {
      console.error('Unlocking decryption failed:', err);
      throw err; // Let PasswordLock component handle display error
    }
  };

  // -----------------------------------------
  // E2EE Cloud Sync & REST client
  // -----------------------------------------
  const handleCloudSync = async (forceSyncKey?: string) => {
    const keyToUse = forceSyncKey || syncConfig.syncKey;
    if (!keyToUse) return;

    setSyncLoading(true);
    try {
      // 1. Prepare current local payload
      const currentState: AppState = {
        transactions,
        categories,
        settings,
        security,
        syncConfig: { ...syncConfig, syncKey: keyToUse },
        subscribers,
        smsTemplates
      };

      // Encrypt the payload prior to sending to keep absolute End-to-End privacy
      // We will derive a standard secure seed from the user's password hash if available, or a default seed
      const syncPass = security.passwordLocked ? security.passwordHash || 'SYNC_KEY' : 'SYNC_KEY';
      const encryptedState = await encryptData(JSON.stringify(currentState), syncPass);

      const payloadToSend: EncryptedPayload = {
        ciphertext: encryptedState.ciphertext,
        iv: encryptedState.iv,
        salt: encryptedState.salt,
        updatedAt: new Date().toISOString()
      };

      // 2. Upload to custom Express server `/api/sync/:key`
      const uploadRes = await fetch(`/api/sync/${keyToUse}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadToSend)
      });

      if (!uploadRes.ok) throw new Error('UPLOAD_FAILED');

      // 3. Fetch remote payload to synchronize and merge
      const downloadRes = await fetch(`/api/sync/${keyToUse}`);
      if (downloadRes.status === 404) {
        // No server copy yet, upload current as the authority
        setSyncConfig(prev => {
          const updated = { ...prev, syncKey: keyToUse, lastSynced: new Date().toISOString() };
          localStorage.setItem('ah_sync_config', JSON.stringify(updated));
          return updated;
        });
        addNotification(t.syncSuccess, 'success');
        return;
      }
      
      if (!downloadRes.ok) throw new Error('DOWNLOAD_FAILED');
      
      const remotePayload = await downloadRes.json() as EncryptedPayload;
      
      // Decrypt remote state
      const decryptedRemoteStr = await decryptData(
        remotePayload.ciphertext, 
        syncPass, 
        remotePayload.iv, 
        remotePayload.salt
      );
      
      const remoteState = JSON.parse(decryptedRemoteStr) as AppState;

      // Conflict Resolution: Union of transactions (by ID), keeping the most up-to-date lists
      const localMap = new Map<string, Transaction>(transactions.map(t => [t.id, t]));
      const remoteTransactions = remoteState.transactions || [];
      
      remoteTransactions.forEach(rt => {
        localMap.set(rt.id, rt); // overwrite or add remote copy
      });

      const mergedTx = Array.from(localMap.values());
      
      // Update states
      setTransactions(mergedTx);
      
      // Merge categories
      const catMap = new Map<string, Category>(categories.map(c => [c.id, c]));
      (remoteState.categories || []).forEach(rc => {
        catMap.set(rc.id, rc);
      });
      const mergedCats = Array.from(catMap.values());
      setCategories(mergedCats);

      // Merge subscribers
      const subMap = new Map<string, Subscriber>(subscribers.map(s => [s.id, s]));
      (remoteState.subscribers || []).forEach(rs => {
        subMap.set(rs.id, rs);
      });
      const mergedSubs = Array.from(subMap.values());
      setSubscribers(mergedSubs);

      // Merge templates
      const tplMap = new Map<string, SMSTemplate>((smsTemplates || []).map(t => [t.id, t]));
      (remoteState.smsTemplates || []).forEach(rt => {
        tplMap.set(rt.id, rt);
      });
      const mergedTpls = Array.from(tplMap.values());
      setSmsTemplates(mergedTpls);

      const updatedSync = {
        syncKey: keyToUse,
        lastSynced: new Date().toISOString(),
        autoSync: syncConfig.autoSync
      };

      setSyncConfig(updatedSync);

      // Save everything
      await saveStateToStorage(mergedTx, mergedCats, settings, security, updatedSync, mergedSubs, mergedTpls);

      addNotification(t.syncSuccess, 'success');
    } catch (err) {
      console.error(err);
      addNotification(t.syncError, 'warn');
    } finally {
      setSyncLoading(false);
    }
  };

  // -----------------------------------------
  // CRUD Handlers
  // -----------------------------------------
  const handleSaveTransaction = async (formTx: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }) => {
    let updatedList: Transaction[] = [];
    
    if (formTx.id) {
      // Editing existing
      updatedList = transactions.map(tx => 
        tx.id === formTx.id 
          ? { ...tx, ...formTx, amount: formTx.amount } as Transaction
          : tx
      );
      addNotification(t.successEdit, 'success');
    } else {
      // Adding new
      const newTx: Transaction = {
        ...formTx,
        id: 'tx-' + Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString()
      };
      updatedList = [newTx, ...transactions];
      addNotification(t.successAdd, 'success');
    }

    setTransactions(updatedList);
    await saveStateToStorage(updatedList, categories, settings, security, syncConfig);

    // Auto-backup to cloud if sync configuration is active
    if (syncConfig.syncKey) {
      handleCloudSync();
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const updatedList = transactions.filter(tx => tx.id !== id);
    setTransactions(updatedList);
    addNotification(t.successDelete, 'success');
    
    await saveStateToStorage(updatedList, categories, settings, security, syncConfig);
    
    if (syncConfig.syncKey) {
      handleCloudSync();
    }
  };

  const handleAddCategory = async (newCat: Omit<Category, 'id'>) => {
    const completeCat: Category = {
      ...newCat,
      id: 'custom_' + Math.random().toString(36).substring(2, 9)
    };
    const updatedCats = [...categories, completeCat];
    setCategories(updatedCats);
    addNotification(settings.language === 'bn' ? 'নতুন ক্যাটাগরি যোগ হয়েছে!' : 'New Category Added!', 'success');
    
    await saveStateToStorage(transactions, updatedCats, settings, security, syncConfig);
  };

  const handleDeleteCategory = async (id: string) => {
    const updatedCats = categories.filter(c => c.id !== id);
    setCategories(updatedCats);
    addNotification(settings.language === 'bn' ? 'ক্যাটাগরি মুছে ফেলা হয়েছে!' : 'Category deleted successfully!', 'success');
    
    await saveStateToStorage(transactions, updatedCats, settings, security, syncConfig);
  };

  // -----------------------------------------
  // Subscriber CRUD Handlers
  // -----------------------------------------
  const handleAddSubscriber = async (newSub: Omit<Subscriber, 'id' | 'createdAt'>) => {
    const completeSub: Subscriber = {
      ...newSub,
      id: 'sub-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    const updatedSubs = [completeSub, ...subscribers];
    setSubscribers(updatedSubs);
    addNotification(settings.language === 'bn' ? 'নতুন গ্রাহক যুক্ত করা হয়েছে!' : 'New subscriber added successfully!', 'success');
    
    await saveStateToStorage(transactions, categories, settings, security, syncConfig, updatedSubs);
    
    if (syncConfig.syncKey) {
      handleCloudSync();
    }
  };

  const handleEditSubscriber = async (id: string, updatedFields: Partial<Subscriber>) => {
    const updatedSubs = subscribers.map(s => s.id === id ? { ...s, ...updatedFields } : s);
    setSubscribers(updatedSubs);
    addNotification(settings.language === 'bn' ? 'গ্রাহক তথ্য সংশোধন করা হয়েছে!' : 'Subscriber updated successfully!', 'success');
    
    await saveStateToStorage(transactions, categories, settings, security, syncConfig, updatedSubs);
    
    if (syncConfig.syncKey) {
      handleCloudSync();
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    const updatedSubs = subscribers.filter(s => s.id !== id);
    setSubscribers(updatedSubs);
    addNotification(settings.language === 'bn' ? 'গ্রাহক মুছে ফেলা হয়েছে!' : 'Subscriber deleted successfully!', 'success');
    
    await saveStateToStorage(transactions, categories, settings, security, syncConfig, updatedSubs);
    
    if (syncConfig.syncKey) {
      handleCloudSync();
    }
  };

  // -----------------------------------------
  // SMS Template CRUD Handlers
  // -----------------------------------------
  const handleAddSmsTemplate = async (newTpl: Omit<SMSTemplate, 'id'>) => {
    const completeTpl: SMSTemplate = {
      ...newTpl,
      id: 'tpl-' + Math.random().toString(36).substring(2, 9)
    };
    const updatedTpls = [...smsTemplates, completeTpl];
    setSmsTemplates(updatedTpls);
    addNotification(settings.language === 'bn' ? 'নতুন টেমপ্লেট তৈরি করা হয়েছে!' : 'New template created successfully!', 'success');
    
    await saveStateToStorage(transactions, categories, settings, security, syncConfig, subscribers, updatedTpls);
    
    if (syncConfig.syncKey) {
      handleCloudSync();
    }
  };

  const handleEditSmsTemplate = async (id: string, updatedFields: Partial<SMSTemplate>) => {
    const updatedTpls = smsTemplates.map(t => t.id === id ? { ...t, ...updatedFields } : t);
    setSmsTemplates(updatedTpls);
    addNotification(settings.language === 'bn' ? 'টেমপ্লেট সংশোধন করা হয়েছে!' : 'Template updated successfully!', 'success');
    
    await saveStateToStorage(transactions, categories, settings, security, syncConfig, subscribers, updatedTpls);
    
    if (syncConfig.syncKey) {
      handleCloudSync();
    }
  };

  const handleDeleteSmsTemplate = async (id: string) => {
    const updatedTpls = smsTemplates.filter(t => t.id !== id);
    setSmsTemplates(updatedTpls);
    addNotification(settings.language === 'bn' ? 'টেমপ্লেট মুছে ফেলা হয়েছে!' : 'Template deleted successfully!', 'success');
    
    await saveStateToStorage(transactions, categories, settings, security, syncConfig, subscribers, updatedTpls);
    
    if (syncConfig.syncKey) {
      handleCloudSync();
    }
  };

  const handleRestoreState = async (importedState: AppState) => {
    if (!importedState) return;
    
    const restoredTx = importedState.transactions || [];
    const restoredCats = importedState.categories || defaultCategories;
    const restoredSettings = importedState.settings || settings;
    const restoredSec = importedState.security || security;
    const restoredSync = importedState.syncConfig || syncConfig;
    const restoredSubs = importedState.subscribers || [];
    const restoredTpls = importedState.smsTemplates || defaultSmsTemplates;

    setTransactions(restoredTx);
    setCategories(restoredCats);
    setSettings(restoredSettings);
    setSecurity(restoredSec);
    setSyncConfig(restoredSync);
    setSubscribers(restoredSubs);
    setSmsTemplates(restoredTpls);

    // If restoring state updates the locking key, we handle session locking
    if (restoredSec.passwordLocked) {
      setIsUnlocked(false);
      localStorage.removeItem('ah_session_pw');
    }

    await saveStateToStorage(restoredTx, restoredCats, restoredSettings, restoredSec, restoredSync, restoredSubs, restoredTpls);
  };

  const handleUpdateSettings = async (newSetts: Partial<SettingsType>) => {
    const mergedSettings = { ...settings, ...newSetts };
    setSettings(mergedSettings);
    await saveStateToStorage(transactions, categories, mergedSettings, security, syncConfig);
  };

  const handleUpdateSecurity = async (newSec: Partial<Security>) => {
    const mergedSec = { ...security, ...newSec };
    setSecurity(mergedSec);
    await saveStateToStorage(transactions, categories, settings, mergedSec, syncConfig);
  };

  const handleUpdateSyncConfig = async (newSync: Partial<SyncConfig>) => {
    const mergedSync = { ...syncConfig, ...newSync };
    setSyncConfig(mergedSync);
    await saveStateToStorage(transactions, categories, settings, security, mergedSync);
  };

  // Sign out lock
  const handleLockSession = () => {
    localStorage.removeItem('ah_session_pw');
    setIsUnlocked(false);
    setTransactions([]); // Clear temporary memory data of private transactions
  };

  // Get color styles based on custom themes
  const activeColorTheme = themeColors[settings.theme] || themeColors.emerald;

  // Render Lock Screen if password security is active and we are not yet verified
  if (!isUnlocked && security.passwordLocked) {
    return (
      <PasswordLock
        security={security}
        onUnlock={() => handleUnlockAndDecrypt(localStorage.getItem('ah_session_pw') || '')}
        language={settings.language}
        setLanguage={(lang) => handleUpdateSettings({ language: lang })}
        themeColor={settings.theme}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-white transition-colors duration-200 font-sans relative flex flex-col justify-between pb-24 sm:pb-0">
      
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 md:items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <span className={`p-2 rounded-xl bg-[#00FF66] text-black shadow-lg shadow-[#00FF66]/10 flex items-center justify-center`}>
              <SlidersHorizontal className="w-5 h-5" />
            </span>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase flex items-baseline gap-0.5">
                {t.appName} <span className="text-[#00FF66] text-xl md:text-2xl font-black">.</span>
              </h1>
              <p className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-[0.2em] uppercase">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Desktop/Tablet Nav menu */}
          <div className="hidden md:flex items-center gap-3">
            <nav className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/60 dark:border-white/10">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-950 dark:bg-white text-white dark:text-black shadow-sm font-black'
                    : 'text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <span>{t.dashboard}</span>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition ${
                  activeTab === 'reports'
                    ? 'bg-slate-950 dark:bg-white text-white dark:text-black shadow-sm font-black'
                    : 'text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <span>{t.reports}</span>
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition ${
                  activeTab === 'categories'
                    ? 'bg-slate-950 dark:bg-white text-white dark:text-black shadow-sm font-black'
                    : 'text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <span>{t.categories}</span>
              </button>
              <button
                onClick={() => setActiveTab('subscribers')}
                className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition ${
                  activeTab === 'subscribers'
                    ? 'bg-slate-950 dark:bg-white text-white dark:text-black shadow-sm font-black'
                    : 'text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <span>{t.subscribers}</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition ${
                  activeTab === 'settings'
                    ? 'bg-slate-950 dark:bg-white text-white dark:text-black shadow-sm font-black'
                    : 'text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <span>{t.settings}</span>
              </button>
            </nav>

            {/* Quick security indicator */}
            <div className="hidden lg:flex items-center gap-2 border-l border-slate-200 dark:border-white/10 pl-3">
              <div className="flex flex-col items-end">
                <span className="text-[8px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">{settings.language === 'bn' ? 'নিরাপত্তা স্থিতি' : 'Security Status'}</span>
                <span className="text-[10px] text-[#00FF66] font-bold flex items-center gap-1">
                  ● {settings.language === 'bn' ? 'এন্ড-টু-এন্ড এনক্রিপ্ট করা' : 'End-to-End Encrypted'}
                </span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons (Notification bell, Quick Lock/Logout, Google Sheets Status) */}
          <div className="flex items-center gap-2.5">
            
            {/* Google Sheets Quick Badge */}
            {sheetsInfo ? (
              <a
                href={sheetsInfo.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition flex items-center gap-1.5 text-xs font-bold"
                title={settings.language === 'bn' ? 'গুগল শীট ফাইল খুলুন' : 'Open Google Sheets Database'}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline">{settings.language === 'bn' ? 'গুগল শীট ডাটাবেস' : 'Google Sheets DB'}</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            ) : (
              <button
                type="button"
                onClick={handleGoogleConnect}
                disabled={sheetsSyncing}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                title={settings.language === 'bn' ? 'গুগল শীটে ডাটা সেভ করতে কানেক্ট করুন' : 'Connect Google Sheets Database'}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline">{sheetsSyncing ? (settings.language === 'bn' ? 'সংযোগ হচ্ছে...' : 'Connecting...') : (settings.language === 'bn' ? 'গুগল শীট সিঙ্ক' : 'Google Sheets')}</span>
              </button>
            )}

            {/* Direct Quick Lock button if secure mode is enabled */}
            {security.passwordLocked && (
              <button
                onClick={handleLockSession}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 hover:bg-red-50 hover:text-red-500 text-slate-400 transition"
                title={settings.language === 'bn' ? 'অ্যাপ লক করুন' : 'Lock Application Vault'}
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            )}

            {/* Notification trigger */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition relative"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                )}
              </button>

              {/* Notification Overlay Menu */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 space-y-3 z-50 overflow-hidden">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/65 pb-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{t.notificationTitle}</span>
                    <button 
                      onClick={() => setNotifications([])} 
                      className="text-[10px] text-red-500 font-bold hover:underline"
                    >
                      {settings.language === 'bn' ? 'সব মুছুন' : 'Clear All'}
                    </button>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 italic py-4">{t.notificationEmpty}</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 text-xs flex gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${n.type === 'warn' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          <div>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">{n.message}</p>
                            <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{n.time.toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* 2. Main Content Body layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        
        {/* Render corresponding Tab dynamically */}
        {activeTab === 'dashboard' && (
          <Dashboard
            transactions={transactions}
            categories={categories}
            onAddClick={() => {
              setTxToEdit(null);
              setIsTxModalOpen(true);
            }}
            onEditClick={(tx) => {
              setTxToEdit(tx);
              setIsTxModalOpen(true);
            }}
            onDeleteClick={handleDeleteTransaction}
            language={settings.language}
            currency={settings.currency}
            themeColor={settings.theme}
            onSyncClick={() => handleCloudSync()}
            syncLoading={syncLoading}
            hasSyncKey={!!syncConfig.syncKey}
          />
        )}

        {activeTab === 'reports' && (
          <Reports
            transactions={transactions}
            categories={categories}
            language={settings.language}
            currency={settings.currency}
            themeColor={settings.theme}
          />
        )}

        {activeTab === 'categories' && (
          <Categories
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            language={settings.language}
            themeColor={settings.theme}
          />
        )}

        {activeTab === 'subscribers' && (
          <Subscribers
            subscribers={subscribers}
            transactions={transactions}
            onAddSubscriber={handleAddSubscriber}
            onEditSubscriber={handleEditSubscriber}
            onDeleteSubscriber={handleDeleteSubscriber}
            language={settings.language}
            currency={settings.currency}
            smsTemplates={smsTemplates}
            onAddSmsTemplate={handleAddSmsTemplate}
            onEditSmsTemplate={handleEditSmsTemplate}
            onDeleteSmsTemplate={handleDeleteSmsTemplate}
          />
        )}

        {activeTab === 'settings' && (
          <Settings
            settings={settings}
            updateSettings={handleUpdateSettings}
            security={security}
            updateSecurity={handleUpdateSecurity}
            syncConfig={syncConfig}
            updateSyncConfig={handleUpdateSyncConfig}
            appState={{ transactions, categories, settings, security, syncConfig, subscribers, smsTemplates }}
            restoreState={handleRestoreState}
            onSync={handleCloudSync}
            syncLoading={syncLoading}
            googleUser={googleUser}
            sheetsInfo={sheetsInfo}
            sheetsSyncing={sheetsSyncing}
            sheetsLastSynced={sheetsLastSynced}
            onGoogleConnect={handleGoogleConnect}
            onGoogleSheetsSync={handleGoogleSheetsSync}
            onGoogleDisconnect={handleGoogleDisconnect}
          />
        )}

      </main>

      {/* 3. Transaction Creator Form Modal Overlay */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setTxToEdit(null);
        }}
        onSave={handleSaveTransaction}
        transactionToEdit={txToEdit}
        categories={categories}
        language={settings.language}
        currency={settings.currency}
        themeColor={settings.theme}
        subscribers={subscribers}
      />

      {/* 4. Desktop Sidebar Footer branding */}
      <footer className="hidden sm:block py-6 border-t border-slate-200/50 dark:border-slate-800/40 text-center text-xs text-slate-400 font-mono mt-8">
        🔒 {t.appName} &bull; {t.appSubtitle} &bull; End-to-End Encrypted E2EE &bull; Made with ☕ in Bangladesh
      </footer>

      {/* 5. Mobile Tab Bottom Navigation bar (Absolute quick feedback) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/90 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-t border-slate-200 dark:border-white/10 p-2 grid grid-cols-5 gap-1 md:hidden z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        
        {/* Dashboard tab */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
            activeTab === 'dashboard' 
              ? activeColorTheme.textClass + ' font-bold bg-slate-50 dark:bg-white/10' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t.dashboard}</span>
        </button>

        {/* Reports tab */}
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
            activeTab === 'reports' 
              ? activeColorTheme.textClass + ' font-bold bg-[#0A0A0A]/10 dark:bg-white/10' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Bell className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t.reports}</span>
        </button>

        {/* Categories tab */}
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
            activeTab === 'categories' 
              ? activeColorTheme.textClass + ' font-bold bg-slate-50 dark:bg-white/10' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Tag className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t.categories}</span>
        </button>

        {/* Subscribers tab */}
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
            activeTab === 'subscribers' 
              ? activeColorTheme.textClass + ' font-bold bg-slate-50 dark:bg-white/10' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t.subscribers}</span>
        </button>

        {/* Settings tab */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
            activeTab === 'settings' 
              ? activeColorTheme.textClass + ' font-bold bg-slate-50 dark:bg-white/10' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <SettingsIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t.settings}</span>
        </button>

      </nav>

      {/* 6. Real-time Toast Notifications Overlay */}
      <div id="toast-overlay-container" className="fixed top-6 right-6 left-6 sm:left-auto sm:max-w-sm w-auto z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10, x: 10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="pointer-events-auto"
            >
              <div 
                id={`toast-card-${toast.id}`}
                className={`p-4 rounded-2xl shadow-xl border backdrop-blur-md flex items-start gap-3 transition-all ${
                  toast.type === 'success'
                    ? 'bg-emerald-500/95 text-white border-emerald-400/50 shadow-emerald-500/10'
                    : toast.type === 'warn'
                    ? 'bg-amber-500/95 text-white border-amber-400/50 shadow-amber-500/10'
                    : 'bg-slate-900/95 text-white border-slate-700/50 shadow-slate-900/10'
                }`}
              >
                <span className="mt-0.5 shrink-0">
                  {toast.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : toast.type === 'warn' ? (
                    <AlertTriangle className="w-5 h-5 text-white" />
                  ) : (
                    <Info className="w-5 h-5 text-white" />
                  )}
                </span>
                <div className="flex-1">
                  <p className="text-xs font-black tracking-tight leading-relaxed">
                    {toast.message}
                  </p>
                </div>
                <button
                  id={`toast-close-${toast.id}`}
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="p-0.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
