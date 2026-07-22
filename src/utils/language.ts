/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category } from '../types';

export const translations = {
  bn: {
    appName: 'আমার হিসাব',
    appSubtitle: 'আইএসপি, ইন্টারনেট ও ওয়াইফাই ব্যবসার ডিজিটাল ক্যাশ লেজার',
    dashboard: 'ড্যাশবোর্ড',
    transactions: 'লেনদেন সমূহ',
    reports: 'মাসিক রিপোর্ট',
    categories: 'ক্যাটাগরি',
    subscribers: 'গ্রাহক তালিকা',
    settings: 'সেটিংস',
    
    // Summary Cards
    currentBalance: 'বর্তমান স্থিতি (ব্যালেন্স)',
    totalIncome: 'মোট আয়',
    totalExpense: 'মোট ব্যয়',
    cashFlow: 'আর্থিক প্রবাহ',
    
    // General Actions
    addTransaction: 'নতুন লেনদেন',
    editTransaction: 'লেনদেন সংশোধন',
    deleteTransaction: 'লেনদেন মুছুন',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    delete: 'মুছে ফেলুন',
    exportExcel: 'এক্সেল এক্সপোর্ট',
    importBackup: 'ডাটা ইম্পোর্ট',
    exportBackup: 'ডাটা এক্সপোর্ট',
    searchPlaceholder: 'গ্রাহক নাম, আইডি বা বিবরণ খুঁজুন...',
    
    // Forms
    type: 'ধরন',
    amount: 'টাকার পরিমাণ',
    category: 'ক্যাটাগরি নির্বাচন করুন',
    date: 'তারিখ',
    description: 'সংক্ষিপ্ত বিবরণ বা গ্রাহক তথ্য (ঐচ্ছিক)',
    selectCategory: 'ক্যাটাগরি সিলেক্ট করুন',
    all: 'সব',
    
    // Categories
    salary: 'স্টাফদের বেতন',
    business: 'ব্রডব্যান্ড গ্রাহক বিল',
    investment: 'নতুন সংযোগ ফি',
    freelancing: 'রাউটার ও অনু বিক্রি',
    gifts: 'হটস্পট টিকিট',
    others: 'অন্যান্য',
    food: 'ব্যান্ডউইথ/আপস্ট্রিম বিল',
    rent: 'বিদ্যুৎ ও অফিস ভাড়া',
    transport: 'স্প্লাইসিং ও ক্যাবল কাজ',
    utilities: 'পোল ভাড়া ও অন্যান্য',
    shopping: 'রাউটার/অনু ডিভাইস ক্রয়',
    entertainment: 'বিনোদন',
    medical: 'চিকিৎসা ও ওষুধ',
    education: 'শিক্ষা খরচ',
    mobile: 'মোবাইল ও ইন্টারনেট',
    
    // Notifications & Messages
    successAdd: 'লেনদেনটি সফলভাবে যোগ করা হয়েছে!',
    successEdit: 'লেনদেনটি সফলভাবে সংশোধন করা হয়েছে!',
    successDelete: 'লেনদেনটি সফলভাবে মুছে ফেলা হয়েছে!',
    errorAmount: 'দয়া করে সঠিক পরিমাণ লিখুন।',
    errorCategory: 'দয়া করে একটি ক্যাটাগরি সিলেক্ট করুন।',
    budgetAlert: 'সতর্কতা! আপনার ব্যয় আয়ের চেয়ে বেশি হচ্ছে!',
    notificationTitle: 'বিজ্ঞপ্তি',
    notificationEmpty: 'কোন নতুন নোটিফিকেশন নেই',
    backupSuccess: 'স্থানীয় ব্যাকআপ সফলভাবে সম্পন্ন হয়েছে!',
    importSuccess: 'আপনার ডাটা সফলভাবে পুনরুদ্ধার করা হয়েছে!',
    importError: 'ভুল ফাইল বা এনক্রিপশন পাসওয়ার্ড অমিল!',
    
    // Settings & Security
    generalSettings: 'সাধারণ সেটিংস',
    language: 'ভাষা (Language)',
    currency: 'মুদ্রা (Currency)',
    securitySettings: 'নিরাপত্তা ও পাসওয়ার্ড লক',
    enableLock: 'পাসওয়ার্ড লক চালু করুন',
    disableLock: 'পাসওয়ার্ড লক বন্ধ করুন',
    setPassword: 'নতুন পাসওয়ার্ড সেট করুন',
    enterPassword: 'অ্যাপটি আনলক করতে পাসওয়ার্ড দিন',
    passwordHint: 'পাসওয়ার্ডের ইঙ্গিত (Hint)',
    passwordIncorrect: 'ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।',
    appLocked: 'অ্যাপটি সুরক্ষিত লক অবস্থায় আছে',
    unlockBtn: 'আনলক করুন',
    setLockSuccess: 'পাসওয়ার্ড লক সফলভাবে সেট করা হয়েছে!',
    disableLockSuccess: 'পাসওয়ার্ড লক বন্ধ করা হয়েছে!',
    
    // Theme
    customTheme: 'কাস্টম থিম নির্বাচন',
    themeEmerald: 'সবুজ (শান্তিজড়িত)',
    themeIndigo: 'নীল (রাজকীয়)',
    themeAmber: 'হলুদ (উজ্জ্বল)',
    themeRose: 'গোলাপী (মিষ্টি)',
    themeSlate: 'ধূসর (ক্লাসিক)',
    darkMode: 'ডার্ক মোড (রাতের আলো)',
    
    // Cloud Sync
    cloudSyncTitle: 'ক্লাউড সিঙ্ক ও ব্যাকআপ',
    cloudSyncDesc: 'আপনার এন্ড-টু-এন্ড এনক্রিপ্ট করা ডাটা ক্লাউডে সিঙ্ক করুন এবং মাল্টি-ডিভাইস ব্যবহার করুন।',
    syncKeyLabel: 'ডিভাইস সিঙ্ক কোড (Sync Code)',
    generateSyncKey: 'নতুন সিঙ্ক কোড তৈরি করুন',
    syncNow: 'এখনই সিঙ্ক করুন',
    syncCodePlaceholder: 'অন্য ডিভাইসের সিঙ্ক কোড দিন',
    connectDevice: 'কোড দিয়ে সিঙ্ক কানেক্ট করুন',
    syncSuccess: 'ক্লাউড সিঙ্ক সফলভাবে সম্পন্ন হয়েছে!',
    syncError: 'সিঙ্ক করতে ব্যর্থ হয়েছে! নেটওয়ার্ক সংযোগ চেক করুন।',
    autoSyncLabel: 'স্বয়ংক্রিয় ক্লাউড সিঙ্ক',
    autoBackupLabel: 'অটো ব্যাকআপ (প্রতিদিন)',
    
    // Reports
    monthlyOverview: 'মাসিক আয়-ব্যয়ের বিশ্লেষণ',
    incomeVsExpense: 'আয় বনাম ব্যয়',
    categoryAnalysis: 'ক্যাটাগরি ভিত্তিক ব্যয় বিশ্লেষণ',
    noData: 'এই মাসে কোন লেনদেনের তথ্য পাওয়া যায়নি।'
  },
  en: {
    appName: 'আমার হিসাব',
    appSubtitle: 'Digital Ledger for ISP, Internet & WiFi Businesses',
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    reports: 'Monthly Reports',
    categories: 'Categories',
    subscribers: 'Subscribers',
    settings: 'Settings',
    
    // Summary Cards
    currentBalance: 'Current Balance',
    totalIncome: 'Total Income',
    totalExpense: 'Total Expense',
    cashFlow: 'Cash Flow',
    
    // General Actions
    addTransaction: 'Add Transaction',
    editTransaction: 'Edit Transaction',
    deleteTransaction: 'Delete Transaction',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    exportExcel: 'Export Excel/CSV',
    importBackup: 'Import Data',
    exportBackup: 'Export Backup',
    searchPlaceholder: 'Search subscriber, ID or description...',
    
    // Forms
    type: 'Type',
    amount: 'Amount',
    category: 'Category',
    date: 'Date',
    description: 'Short Description or Subscriber Details (Optional)',
    selectCategory: 'Select Category',
    all: 'All',
    
    // Categories
    salary: 'Staff Salary',
    business: 'Subscriber Monthly Bill',
    investment: 'New Connection Fee',
    freelancing: 'Router & ONU Sales',
    gifts: 'Hotspot Tickets',
    others: 'Other Income',
    food: 'Bandwidth & Upstream Cost',
    rent: 'Electric & Office Rent',
    transport: 'Splicing & Cables',
    utilities: 'Pole Rent & Overheads',
    shopping: 'Device Purchase (Router/ONU)',
    entertainment: 'Entertainment',
    medical: 'Medical & Healthcare',
    education: 'Education',
    mobile: 'Mobile & Internet',
    
    // Notifications & Messages
    successAdd: 'Transaction added successfully!',
    successEdit: 'Transaction updated successfully!',
    successDelete: 'Transaction deleted successfully!',
    errorAmount: 'Please enter a valid amount.',
    errorCategory: 'Please select a category.',
    budgetAlert: 'Alert! Your total expense is exceeding your income!',
    notificationTitle: 'Notifications',
    notificationEmpty: 'No new notifications',
    backupSuccess: 'Local backup completed successfully!',
    importSuccess: 'Data restored successfully!',
    importError: 'Invalid file or password mismatch!',
    
    // Settings & Security
    generalSettings: 'General Settings',
    language: 'Language',
    currency: 'Currency',
    securitySettings: 'Security & Password Lock',
    enableLock: 'Enable Password Lock',
    disableLock: 'Disable Password Lock',
    setPassword: 'Set New Password',
    enterPassword: 'Enter Password to Unlock App',
    passwordHint: 'Password Hint',
    passwordIncorrect: 'Incorrect Password! Please try again.',
    appLocked: 'App is Securely Locked',
    unlockBtn: 'Unlock Now',
    setLockSuccess: 'Password lock configured successfully!',
    disableLockSuccess: 'Password lock removed successfully!',
    
    // Theme
    customTheme: 'Custom Theme Accent',
    themeEmerald: 'Emerald Green (Calm)',
    themeIndigo: 'Indigo Blue (Royal)',
    themeAmber: 'Amber Yellow (Vibrant)',
    themeRose: 'Rose Pink (Sweet)',
    themeSlate: 'Slate Gray (Classic)',
    darkMode: 'Dark Mode (Comfortable Dark)',
    
    // Cloud Sync
    cloudSyncTitle: 'Cloud Sync & Multi-Device',
    cloudSyncDesc: 'Securely sync your end-to-end encrypted ledger data to use across devices.',
    syncKeyLabel: 'Device Sync Code',
    generateSyncKey: 'Generate Sync Code',
    syncNow: 'Sync Now',
    syncCodePlaceholder: 'Enter sync code from other device',
    connectDevice: 'Connect & Sync Code',
    syncSuccess: 'Cloud sync completed successfully!',
    syncError: 'Sync failed! Please check your connection.',
    autoSyncLabel: 'Auto Cloud Sync',
    autoBackupLabel: 'Auto Backup (Daily)',
    
    // Reports
    monthlyOverview: 'Monthly Overview Analysis',
    incomeVsExpense: 'Income vs Expense',
    categoryAnalysis: 'Category-wise Expense Breakdown',
    noData: 'No transaction data available for this month.'
  }
};

export const defaultCategories: Category[] = [
  // Income
  { id: 'cat_sub_collection', name_bn: 'গ্রাহক মাসিক বিল', name_en: 'Subscriber Monthly Bill', type: 'income', icon: 'Wifi', color: '#10B981' },
  { id: 'cat_new_conn', name_bn: 'নতুন সংযোগ ফি', name_en: 'New Connection Fee', type: 'income', icon: 'Plug', color: '#059669' },
  { id: 'cat_hardware_sale', name_bn: 'রাউটার ও অনু বিক্রি', name_en: 'Router & ONU Sales', type: 'income', icon: 'Cpu', color: '#34D399' },
  { id: 'cat_hotspot', name_bn: 'হটস্পট কার্ড/টিকিট', name_en: 'Hotspot Cards/Tickets', type: 'income', icon: 'Ticket', color: '#8B5CF6' },
  { id: 'cat_inc_others', name_bn: 'অন্যান্য আয়', name_en: 'Other Income', type: 'income', icon: 'DollarSign', color: '#6EE7B7' },
  
  // Expense
  { id: 'cat_bandwidth', name_bn: 'ব্যান্ডউইথ/আপস্ট্রিম বিল', name_en: 'Bandwidth & Upstream Cost', type: 'expense', icon: 'Server', color: '#EF4444' },
  { id: 'cat_cable_fiber', name_bn: 'অপটিক্যাল ফাইবার ও তার', name_en: 'Optical Fiber & Cables', type: 'expense', icon: 'GitCommit', color: '#F59E0B' },
  { id: 'cat_box_onu', name_bn: 'রাউটার/ওএনইউ/ডিভাইস ক্রয়', name_en: 'ONU & Router Purchase', type: 'expense', icon: 'Box', color: '#EC4899' },
  { id: 'cat_salary', name_bn: 'স্টাফ বেতন ও বোনাস', name_en: 'Staff Salary & Bonus', type: 'expense', icon: 'Users', color: '#3B82F6' },
  { id: 'cat_electric_rent', name_bn: 'বিদ্যুৎ বিল ও অফিস ভাড়া', name_en: 'Electric Bill & Office Rent', type: 'expense', icon: 'Zap', color: '#8B5CF6' },
  { id: 'cat_splicing', name_bn: 'স্প্লাইসিং ও সংযোগ কাজ', name_en: 'Splicing & Connection', type: 'expense', icon: 'Wrench', color: '#14B8A6' },
  { id: 'cat_pole_charge', name_bn: 'ডিশ/কারেন্ট পোল ভাড়া', name_en: 'Pole Rent / Overhead Charge', type: 'expense', icon: 'Layers', color: '#F43F5E' },
  { id: 'cat_exp_others', name_bn: 'অন্যান্য খরচ', name_en: 'Other Expenses', type: 'expense', icon: 'CreditCard', color: '#64748B' }
];

export const themeColors = {
  emerald: {
    primary: 'emerald',
    primaryClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    textClass: 'text-emerald-600',
    borderClass: 'border-emerald-600',
    ringClass: 'focus:ring-emerald-500',
    gradientClass: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/20',
  },
  indigo: {
    primary: 'indigo',
    primaryClass: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    textClass: 'text-indigo-600',
    borderClass: 'border-indigo-600',
    ringClass: 'focus:ring-indigo-500',
    gradientClass: 'from-indigo-500 to-blue-600',
    bgLight: 'bg-indigo-50 dark:bg-indigo-950/20',
  },
  amber: {
    primary: 'amber',
    primaryClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    textClass: 'text-amber-600',
    borderClass: 'border-amber-600',
    ringClass: 'focus:ring-amber-500',
    gradientClass: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50 dark:bg-amber-950/20',
  },
  rose: {
    primary: 'rose',
    primaryClass: 'bg-rose-600 hover:bg-rose-700 text-white',
    textClass: 'text-rose-600',
    borderClass: 'border-rose-600',
    ringClass: 'focus:ring-rose-500',
    gradientClass: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50 dark:bg-rose-950/20',
  },
  slate: {
    primary: 'slate',
    primaryClass: 'bg-slate-700 hover:bg-slate-800 text-white',
    textClass: 'text-slate-700 dark:text-slate-300',
    borderClass: 'border-slate-700',
    ringClass: 'focus:ring-slate-500',
    gradientClass: 'from-slate-600 to-zinc-700',
    bgLight: 'bg-slate-100 dark:bg-slate-800/40',
  }
};
