/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, Unlock, Shield, Key, Eye, EyeOff, Globe, Sparkles, 
  RefreshCw, Cloud, Save, Download, Upload, Info, Check, AlertCircle, Sun, Moon
} from 'lucide-react';
import { Settings as SettingsType, Security, SyncConfig, AppState } from '../types';
import { translations, themeColors } from '../utils/language';
import { generateSalt, hashPassword } from '../utils/crypto';
import { exportEncryptedBackup, importBackupFile } from '../utils/backup';
import { FileSpreadsheet, ExternalLink, Database, CheckCircle2, LogOut } from 'lucide-react';

interface SettingsProps {
  settings: SettingsType;
  updateSettings: (newSettings: Partial<SettingsType>) => void;
  security: Security;
  updateSecurity: (newSecurity: Partial<Security>) => void;
  syncConfig: SyncConfig;
  updateSyncConfig: (newSync: Partial<SyncConfig>) => void;
  appState: AppState;
  restoreState: (restoredState: AppState) => void;
  onSync: (syncKeyToUse?: string) => Promise<void>;
  syncLoading: boolean;
  googleUser?: any;
  sheetsInfo?: { spreadsheetId: string; spreadsheetUrl: string } | null;
  sheetsSyncing?: boolean;
  sheetsLastSynced?: string | null;
  onGoogleConnect?: () => void;
  onGoogleSheetsSync?: () => void;
  onGoogleDisconnect?: () => void;
}

export default function Settings({
  settings,
  updateSettings,
  security,
  updateSecurity,
  syncConfig,
  updateSyncConfig,
  appState,
  restoreState,
  onSync,
  syncLoading,
  googleUser,
  sheetsInfo,
  sheetsSyncing,
  sheetsLastSynced,
  onGoogleConnect,
  onGoogleSheetsSync,
  onGoogleDisconnect
}: SettingsProps) {
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [hintInput, setHintInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSettingLock, setIsSettingLock] = useState(false);
  
  // File Import states
  const [importPassword, setImportPassword] = useState('');
  const [importError, setImportError] = useState('');
  const [pendingImportFile, setPendingImportFile] = useState<string | null>(null);
  const [showImportPasswordPrompt, setShowImportPasswordPrompt] = useState(false);

  // Sync Input key state
  const [joinSyncKey, setJoinSyncKey] = useState('');
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  const t = translations[settings.language];

  // Theme Accent Selectors
  const themeList: Array<'emerald' | 'indigo' | 'amber' | 'rose' | 'slate'> = [
    'emerald', 'indigo', 'amber', 'rose', 'slate'
  ];

  const handleToggleLock = () => {
    if (security.passwordLocked) {
      // Disabling lock: require current password
      setIsSettingLock(true);
    } else {
      // Enabling lock
      setIsSettingLock(true);
      setPasswordInput('');
      setConfirmPasswordInput('');
      setHintInput('');
      setPasswordError('');
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (security.passwordLocked) {
      // Trying to DISABLE lock
      const salt = security.salt || '';
      const hashed = await hashPassword(passwordInput, salt);
      if (hashed === security.passwordHash) {
        updateSecurity({
          passwordLocked: false,
          passwordHash: null,
          salt: null,
          hint: ''
        });
        setIsSettingLock(false);
        setPasswordInput('');
        setSyncStatusMsg(t.disableLockSuccess);
        setTimeout(() => setSyncStatusMsg(''), 3000);
      } else {
        setPasswordError(t.passwordIncorrect);
      }
    } else {
      // Trying to ENABLE lock
      if (passwordInput.length < 4) {
        setPasswordError(settings.language === 'bn' ? 'পাসওয়ার্ড অন্তত ৪ সংখ্যার হতে হবে।' : 'Password must be at least 4 characters.');
        return;
      }
      if (passwordInput !== confirmPasswordInput) {
        setPasswordError(settings.language === 'bn' ? 'পাসওয়ার্ড মেলেনি!' : 'Passwords do not match!');
        return;
      }

      const salt = generateSalt(16);
      const hashed = await hashPassword(passwordInput, salt);
      updateSecurity({
        passwordLocked: true,
        passwordHash: hashed,
        salt,
        hint: hintInput
      });
      setIsSettingLock(false);
      setPasswordInput('');
      setConfirmPasswordInput('');
      setHintInput('');
      setSyncStatusMsg(t.setLockSuccess);
      setTimeout(() => setSyncStatusMsg(''), 3000);
    }
  };

  // Export encrypted backup locally
  const handleExportBackupFile = async () => {
    try {
      // Prompt sync pass if locked
      const exportPassword = security.passwordLocked ? 'SECURE_BACKUP_KEY' : undefined; // we can use a standard password or custom
      // For military-grade E2EE, we will ask or use current hashed state if locked
      const dataStr = await exportEncryptedBackup(appState, security.passwordLocked ? security.passwordHash || undefined : undefined);
      
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `amar_hisab_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSyncStatusMsg(t.backupSuccess);
      setTimeout(() => setSyncStatusMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Import Backup File
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError('');
    setImportPassword('');
    
    fileReader.onload = (event) => {
      const fileContent = event.target?.result as string;
      try {
        const parsed = JSON.parse(fileContent);
        if (parsed.encrypted) {
          // If the file is encrypted, we must ask the user for the password to decrypt it
          setPendingImportFile(fileContent);
          setShowImportPasswordPrompt(true);
        } else {
          // Unencrypted file, import directly
          restoreState(JSON.parse(parsed.payload));
          setSyncStatusMsg(t.importSuccess);
          setTimeout(() => setSyncStatusMsg(''), 3000);
        }
      } catch (err) {
        setImportError(t.importError);
      }
    };
    fileReader.readAsText(file);
  };

  const handleImportSubmitWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');
    if (!pendingImportFile) return;

    try {
      // The backup encrypts with either user-specified password or standard hash. Let's try decryption
      const restored = await importBackupFile(pendingImportFile, importPassword);
      restoreState(restored);
      setShowImportPasswordPrompt(false);
      setPendingImportFile(null);
      setSyncStatusMsg(t.importSuccess);
      setTimeout(() => setSyncStatusMsg(''), 3000);
    } catch (err) {
      setImportError(t.importError);
    }
  };

  // Generate a random Cloud Sync Key
  const handleGenerateCloudSyncKey = () => {
    const randomKey = 'hisab-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    updateSyncConfig({
      syncKey: randomKey
    });
    setSyncStatusMsg(settings.language === 'bn' ? 'নতুন সিঙ্ক কোড তৈরি হয়েছে!' : 'New Sync Code Generated!');
    setTimeout(() => setSyncStatusMsg(''), 3000);
  };

  const handleJoinSync = async () => {
    if (!joinSyncKey) return;
    try {
      await onSync(joinSyncKey.toUpperCase());
    } catch (err) {
      // Error handled by caller
    }
  };

  // Theme Styling Helpers
  const currentThemeColor = themeColors[settings.theme] || themeColors.emerald;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Toast Messages */}
      {syncStatusMsg && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-full text-sm font-semibold shadow-2xl border border-slate-800 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{syncStatusMsg}</span>
        </motion.div>
      )}

      {/* General Settings Card */}
      <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-6 shadow-sm space-y-5">
        <h3 className="text-lg font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Globe className={`w-5 h-5 text-slate-900 dark:text-[#00FF66]`} />
          <span>{t.generalSettings}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Language selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">{t.language}</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/10">
              <button
                onClick={() => updateSettings({ language: 'bn' })}
                className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  settings.language === 'bn' 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => updateSettings({ language: 'en' })}
                className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  settings.language === 'en' 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Currency selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">{t.currency}</label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/10">
              {['৳', '$', '₹', '€'].map((curr) => (
                <button
                  key={curr}
                  onClick={() => updateSettings({ currency: curr as any })}
                  className={`py-2 rounded-lg text-xs font-black transition cursor-pointer ${
                    settings.currency === curr 
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Toggle Dark Mode & Auto Sync */}
        <div className="pt-2 space-y-3.5">
          {/* Dark Mode Switch */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200/40 dark:border-slate-800/40">
                {settings.darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </div>
              <div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 block">{t.darkMode}</span>
                <span className="text-xs text-slate-400">{settings.language === 'bn' ? 'কালো বা সাদা থিমে অ্যাপ ব্যবহার' : 'Switch dark or light appearance'}</span>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ darkMode: !settings.darkMode })}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                settings.darkMode ? 'bg-indigo-500' : 'bg-slate-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                settings.darkMode ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Auto Backup switch */}
          <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-850/60 pt-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200/40 dark:border-slate-800/40">
                <RefreshCw className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 block">{t.autoBackupLabel}</span>
                <span className="text-xs text-slate-400">{settings.language === 'bn' ? 'স্বয়ংক্রিয়ভাবে ডাটা ব্যাকআপ সংরক্ষণ' : 'Automatic daily state persistence'}</span>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ autoBackup: !settings.autoBackup })}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                settings.autoBackup ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                settings.autoBackup ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

      </div>

      {/* Google Sheets Database Integration Card */}
      <div className="bg-white dark:bg-[#0A0A0A] border border-emerald-500/30 dark:border-emerald-500/30 rounded-3xl p-5 md:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>{settings.language === 'bn' ? 'গুগল শীট ডাটাবেস সংযোগ' : 'Google Sheets Database'}</span>
                {googleUser && (
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{settings.language === 'bn' ? 'সংযুক্ত' : 'Connected'}</span>
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                {settings.language === 'bn' 
                  ? 'আপনার সমস্ত লেনদেন ও গ্রাহকের তথ্য সরাসরি গুগল ড্রাইভ ও গুগলে শীটে ক্লাউড ডাটাবেস হিসেবে সেভ থাকবে।' 
                  : 'Store all transactions and subscriber records directly in your Google Sheets database in Google Drive.'}
              </p>
            </div>
          </div>

          {googleUser ? (
            <button
              type="button"
              onClick={onGoogleDisconnect}
              className="self-start sm:self-auto px-3.5 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-950/40 transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{settings.language === 'bn' ? 'ডিসকানেক্ট' : 'Disconnect'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onGoogleConnect}
              disabled={sheetsSyncing}
              className="self-start sm:self-auto px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-slate-900 dark:bg-emerald-500 dark:text-black hover:opacity-90 shadow-lg shadow-emerald-500/10 transition flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{sheetsSyncing ? (settings.language === 'bn' ? 'সংযোগ হচ্ছে...' : 'Connecting...') : (settings.language === 'bn' ? 'গুগল সাইন-ইন করে শীট কানেক্ট করুন' : 'Sign in with Google')}</span>
            </button>
          )}
        </div>

        {googleUser && sheetsInfo && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/60 dark:border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">{settings.language === 'bn' ? 'গুগল অ্যাকাউন্ট:' : 'Google Account:'}</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">{googleUser.email || googleUser.displayName}</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">{settings.language === 'bn' ? 'ডাটাবেস ফাইলের নাম:' : 'Database File:'}</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">আমার হিসাব - ডাটাবেস</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <a
                href={sheetsInfo.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 text-xs font-bold hover:underline flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>{settings.language === 'bn' ? 'গুগল শীট ফাইল সরাসরি খুলুন' : 'Open Live Spreadsheet in Google Sheets'}</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>

              <button
                type="button"
                onClick={onGoogleSheetsSync}
                disabled={sheetsSyncing}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-wider hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${sheetsSyncing ? 'animate-spin' : ''}`} />
                <span>{sheetsSyncing ? (settings.language === 'bn' ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') : (settings.language === 'bn' ? 'এখনই সিঙ্ক করুন' : 'Sync to Sheets Now')}</span>
              </button>
            </div>

            {sheetsLastSynced && (
              <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-500" />
                <span>{settings.language === 'bn' ? 'সর্বশেষ শীট ডাটাবেস সিঙ্ক:' : 'Last Google Sheets Sync:'} {new Date(sheetsLastSynced).toLocaleString(settings.language === 'bn' ? 'bn-BD' : 'en-US')}</span>
              </p>
            )}
          </div>
        )}
      </div>
      <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className={`w-5 h-5 text-slate-900 dark:text-[#00FF66]`} />
          <span>{t.customTheme}</span>
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {themeList.map((th) => {
            const details = themeColors[th];
            const isSelected = settings.theme === th;
            return (
              <button
                key={th}
                onClick={() => updateSettings({ theme: th })}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-black uppercase tracking-wider transition active:scale-95 cursor-pointer ${
                  isSelected 
                    ? 'border-slate-950 dark:border-white bg-slate-100 dark:bg-white/5 shadow-sm' 
                    : 'border-slate-200/60 dark:border-white/10 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50'
                }`}
              >
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${details.gradientClass} shadow-md flex items-center justify-center`}>
                  {isSelected && <Check className="w-4 h-4 text-white stroke-[3px]" />}
                </div>
                <span className="text-slate-600 dark:text-slate-300">
                  {settings.language === 'bn' ? t[`theme${th.charAt(0).toUpperCase() + th.slice(1)}` as any] : th.charAt(0).toUpperCase() + th.slice(1)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Password Security Lock Card */}
      <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-900 dark:text-[#00FF66]" />
            <div>
              <h3 className="text-lg font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">{t.securitySettings}</h3>
              <p className="text-xs text-slate-400">{settings.language === 'bn' ? 'পিন বা পাসওয়ার্ড দিয়ে হিসাব লক করে রাখুন' : 'Protect your data ledger with vault locking'}</p>
            </div>
          </div>
          
          <button
            onClick={handleToggleLock}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border transition cursor-pointer ${
              security.passwordLocked 
                ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30' 
                : 'bg-emerald-50 dark:bg-white/5 text-emerald-600 dark:text-[#00FF66] border-emerald-200 dark:border-white/10'
            }`}
          >
            {security.passwordLocked ? t.disableLock : t.enableLock}
          </button>
        </div>

        {/* Security Info/Hint when Locked */}
        {security.passwordLocked && !isSettingLock && (
          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 flex gap-3 text-xs text-slate-500">
            <Lock className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-300">{settings.language === 'bn' ? 'লক সিকিউরিটি সক্রিয় রয়েছে' : 'Vault Security is Active'}</p>
              <p className="mt-0.5">{settings.language === 'bn' ? 'পরবর্তী বার যখন অ্যাপে প্রবেশ করবেন, তখন সঠিক পাসওয়ার্ড দিয়ে আনলক করতে হবে।' : 'The next time you open the ledger app, you will need to input your PIN/Password.'}</p>
              {security.hint && (
                <p className="mt-2 text-[10px] text-slate-400 font-mono">💡 {t.passwordHint}: {security.hint}</p>
              )}
            </div>
          </div>
        )}

        {/* Setting up security Form modal-in-place */}
        {isSettingLock && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            onSubmit={handleSaveSecurity}
            className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-3"
          >
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500 mb-1">
              <Key className="w-4 h-4 text-yellow-500" />
              <span>{security.passwordLocked ? t.disableLock : t.setPassword}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Password */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{security.passwordLocked ? (settings.language === 'bn' ? 'বর্তমান পাসওয়ার্ড' : 'Current Password') : t.setPassword}</span>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••"
                    className="w-full px-4 py-2 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (only if enabling) */}
              {!security.passwordLocked && (
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{settings.language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="••••"
                    className="w-full px-4 py-2 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold focus:outline-none"
                    required
                  />
                </div>
              )}
            </div>

            {/* Hint (only if enabling) */}
            {!security.passwordLocked && (
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.passwordHint}</span>
                <input
                  type="text"
                  value={hintInput}
                  onChange={(e) => setHintInput(e.target.value)}
                  placeholder={settings.language === 'bn' ? 'সহজে মনে রাখার ইঙ্গিত (যেমন: প্রিয় সংখ্যা, প্রিয় শখ)' : 'e.g. Favorite number, birth month'}
                  className="w-full px-4 py-2 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold focus:outline-none"
                />
              </div>
            )}

            {passwordError && (
              <div className="flex items-center gap-1.5 text-xs text-red-500 font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{passwordError}</span>
              </div>
            )}

            {/* Save Buttons */}
            <div className="flex gap-2.5 pt-1.5">
              <button
                type="button"
                onClick={() => setIsSettingLock(false)}
                className="flex-1 py-2 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-slate-900 dark:bg-[#00FF66] text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                {t.save}
              </button>
            </div>
          </motion.form>
        )}
      </div>

      {/* Local Backup and Import/Export Card */}
      <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Download className="w-5 h-5 text-slate-900 dark:text-[#00FF66]" />
          <span>{settings.language === 'bn' ? 'ডাটা ব্যাকআপ ও পুনরুদ্ধার' : 'Data Backup & Import/Export'}</span>
        </h3>
        <p className="text-xs text-slate-400">{settings.language === 'bn' ? 'আপনার ডিভাইস পরিবর্তন বা ডাটা ব্যাকআপ রাখার জন্য ফাইল এক্সপোর্ট ও ইম্পোর্ট করুন।' : 'Export or import your full ledger data file for manual transfers and safety backups.'}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          
          {/* Export File Button */}
          <button
            onClick={handleExportBackupFile}
            className="flex items-center justify-center gap-2 px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-sm uppercase tracking-wider transition active:scale-95 cursor-pointer"
          >
            <Download className="w-5 h-5 text-indigo-500" />
            <span>{t.exportBackup}</span>
          </button>

          {/* Import File Button */}
          <label className="flex items-center justify-center gap-2 px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-sm uppercase tracking-wider cursor-pointer transition active:scale-95">
            <Upload className="w-5 h-5 text-emerald-500" />
            <span>{t.importBackup}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFileChange}
              className="hidden"
            />
          </label>

        </div>

        {/* Encrypted Import Password Prompt Modal-in-place */}
        {showImportPasswordPrompt && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleImportSubmitWithPassword}
            className="p-4 bg-red-50/40 dark:bg-red-950/10 border border-red-200 dark:border-red-950/40 rounded-2xl space-y-3 mt-3"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400">
              <Lock className="w-4 h-4" />
              <span>{settings.language === 'bn' ? 'সংরক্ষিত ফাইলটি পাসওয়ার্ড লক করা!' : 'Encrypted Backup File Detected!'}</span>
            </div>
            <p className="text-[11px] text-slate-500">{settings.language === 'bn' ? 'ফাইলটি আনলক করতে আপনার মূল নিরাপত্তা পাসওয়ার্ড দিন:' : 'Provide the original password used to lock this backup file:'}</p>
            
            <div className="flex gap-2">
              <input
                type="password"
                value={importPassword}
                onChange={(e) => setImportPassword(e.target.value)}
                placeholder="••••••"
                className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-950 text-white rounded-xl text-xs font-semibold"
              >
                {settings.language === 'bn' ? 'ডিক্রিপ্ট করুন' : 'Decrypt & Restore'}
              </button>
            </div>

            {importError && (
              <p className="text-xs text-red-500 font-bold">{importError}</p>
            )}
          </motion.form>
        )}
      </div>

      {/* Cloud Sync & End-To-End Encryption Card */}
      <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-6 shadow-sm space-y-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-slate-900 dark:text-[#00FF66]" />
              <span>{t.cloudSyncTitle}</span>
            </h3>
            <p className="text-xs text-slate-400 max-w-md">{t.cloudSyncDesc}</p>
          </div>
          <span className="text-[10px] font-mono bg-indigo-50 dark:bg-white/5 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-white/10 px-2 py-1 rounded-md uppercase font-black shrink-0">
            E2EE SECURE
          </span>
        </div>

        {/* Sync Status / Config Code Display */}
        <div className="p-5 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <span className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest block">{t.syncKeyLabel}</span>
              <span className="text-lg font-mono font-black text-slate-800 dark:text-slate-100 tracking-wider">
                {syncConfig.syncKey || (settings.language === 'bn' ? 'সিঙ্ক নিষ্ক্রিয়' : 'No sync key')}
              </span>
            </div>

            <div className="flex gap-2">
              {/* Generate new key */}
              <button
                type="button"
                onClick={handleGenerateCloudSyncKey}
                className="px-4 py-2 bg-white dark:bg-[#0A0A0A] hover:opacity-90 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                {t.generateSyncKey}
              </button>

              {/* Sync Now */}
              {syncConfig.syncKey && (
                <button
                  type="button"
                  onClick={() => onSync()}
                  disabled={syncLoading}
                  className="px-4 py-2 text-xs font-black uppercase tracking-wider text-black bg-[#00FF66] rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer hover:opacity-90"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
                  <span>{t.syncNow}</span>
                </button>
              )}
            </div>
          </div>

          {/* Connect other device */}
          <div className="border-t border-slate-200/60 dark:border-white/10 pt-4 space-y-2">
            <span className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest block">
              {settings.language === 'bn' ? 'অন্য ডিভাইসে যুক্ত হোন' : 'Sync / Connect other device'}
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={joinSyncKey}
                onChange={(e) => setJoinSyncKey(e.target.value)}
                placeholder={t.syncCodePlaceholder}
                className="flex-1 max-w-xs px-4 py-2.5 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-mono font-bold focus:outline-none uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal"
              />
              <button
                type="button"
                onClick={handleJoinSync}
                disabled={syncLoading}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
              >
                <Cloud className="w-4 h-4" />
                <span>{t.connectDevice}</span>
              </button>
            </div>
          </div>

          {/* Sync logs info */}
          {syncConfig.lastSynced && (
            <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 pt-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>
                {settings.language === 'bn' ? 'সর্বশেষ ক্লাউড সিঙ্ক:' : 'Last Cloud Sync:'}{' '}
                {new Date(syncConfig.lastSynced).toLocaleString(settings.language === 'bn' ? 'bn-BD' : 'en-US')}
              </span>
            </div>
          )}
        </div>

        {/* Security Reminder info */}
        <div className="flex gap-2.5 p-3.5 bg-indigo-50/20 dark:bg-white/5 border border-indigo-100/50 dark:border-white/10 rounded-2xl text-[11px] text-indigo-700 dark:text-slate-300">
          <Info className="w-4 h-4 shrink-0" />
          <p>
            {settings.language === 'bn'
              ? 'নিরাপত্তা সতর্কতা: যেহেতু এটি এন্ড-টু-এন্ড এনক্রিপ্ট করা, সিঙ্ক ব্যবহারের সময় আপনার এবং অপর ডিভাইসের নিরাপত্তা পাসওয়ার্ড অবিকল এক হওয়া প্রয়োজন। নতুবা ডাটা ডিক্রিপ্ট করা যাবে না!'
              : 'Security Alert: Since this is end-to-end encrypted, other syncing devices must share the exact same lock password, or they won\'t be able to decrypt the state payload.'}
          </p>
        </div>

      </div>

    </div>
  );
}
