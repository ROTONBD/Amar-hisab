/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Plus, ArrowUpLeft, ArrowDownRight, Edit2, Trash2, 
  FileSpreadsheet, RefreshCw, Filter, SlidersHorizontal, Info, AlertTriangle, Sparkles
} from 'lucide-react';
import { Category, Transaction } from '../types';
import { translations, themeColors } from '../utils/language';
import { exportToCSV } from '../utils/backup';
import LucideIcon from './LucideIcon';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  onAddClick: () => void;
  onEditClick: (tx: Transaction) => void;
  onDeleteClick: (id: string) => void;
  language: 'bn' | 'en';
  currency: string;
  themeColor: 'emerald' | 'indigo' | 'amber' | 'rose' | 'slate';
  onSyncClick: () => Promise<void>;
  syncLoading: boolean;
  hasSyncKey: boolean;
}

export default function Dashboard({
  transactions,
  categories,
  onAddClick,
  onEditClick,
  onDeleteClick,
  language,
  currency,
  themeColor,
  onSyncClick,
  syncLoading,
  hasSyncKey
}: DashboardProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  const t = translations[language];

  // Calculate Balance Totals (All time)
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const balance = totalIncome - totalExpense;

  // Filter & Search Logic
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase()) ||
      tx.amount.toString().includes(search);
      
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    
    const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Sort logic
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortBy === 'amount-desc') return b.amount - a.amount;
    if (sortBy === 'amount-asc') return a.amount - b.amount;
    return 0;
  });

  // Get current theme details
  const currentTheme = themeColors[themeColor] || themeColors.emerald;

  const handleExportCSV = () => {
    exportToCSV(transactions, language, currency);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Summary Cards Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Total Balance & Sub-Stats (Col Span 8) */}
        <div className="lg:col-span-8 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-sm dark:shadow-none relative overflow-hidden min-h-[300px]">
          {/* Decorative radial glows */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00FF66] opacity-10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-blue-500 opacity-5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.25em]">{t.currentBalance}</span>
              <span className="px-2.5 py-1 text-[10px] bg-slate-900/5 dark:bg-white/10 text-slate-800 dark:text-white rounded-md font-black uppercase tracking-wider">
                {language === 'bn' ? 'ব্যক্তিগত খতিয়ান' : 'Ledger Active'}
              </span>
            </div>
            
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none italic font-sans text-slate-950 dark:text-white flex flex-wrap items-baseline gap-1">
                {currency}{balance.toLocaleString()}
                <span className="text-xl md:text-2xl not-italic opacity-45 ml-1 select-none">.00</span>
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1 tracking-wide">
                {language === 'bn' ? 'সকল লেনদেনের চূড়ান্ত হিসাব' : 'Aggregated accounts ledger summary'}
              </p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-200/60 dark:border-white/10">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-slate-400 dark:text-gray-500 font-black tracking-widest mb-1.5">{t.totalIncome}</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-[#00FF66]">+{currency}{totalIncome.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-slate-400 dark:text-gray-500 font-black tracking-widest mb-1.5">{t.totalExpense}</span>
              <span className="text-2xl font-black text-red-500 dark:text-[#FF3B3B]">-{currency}{totalExpense.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-slate-400 dark:text-gray-500 font-black tracking-widest mb-1.5">{language === 'bn' ? 'সঞ্চয়ের হার' : 'Savings Rate'}</span>
              <span className="text-2xl font-black text-blue-500 dark:text-blue-400">
                {totalIncome > 0 ? ((1 - (totalExpense / totalIncome)) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
          </div>
        </div>

        {/* Sync & Quick Action Column (Col Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Data Sync & Quick Actions Card */}
          <div className={`rounded-3xl p-6 flex flex-col justify-between h-full min-h-[140px] transition-all relative overflow-hidden group ${
            hasSyncKey 
              ? 'bg-[#00FF66] text-black shadow-lg shadow-[#00FF66]/10 border border-transparent' 
              : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white'
          }`}>
            <div className="flex justify-between items-start">
              <h3 className="font-black text-xl leading-tight uppercase tracking-tight">
                {hasSyncKey 
                  ? (language === 'bn' ? 'ক্লাউড ব্যাকআপ সক্রিয়' : 'DATA SYNCED TO CLOUD') 
                  : (language === 'bn' ? 'ক্লাউড সিঙ্ক নিষ্ক্রিয়' : 'CLOUD SYNC INACTIVE')
                }
              </h3>
              {hasSyncKey ? (
                <span className="p-1.5 bg-black/10 rounded-lg">
                  <RefreshCw className={`w-5 h-5 ${syncLoading ? 'animate-spin' : ''}`} />
                </span>
              ) : (
                <span className="p-1.5 bg-slate-100 dark:bg-white/10 rounded-lg">
                  <SlidersHorizontal className="w-5 h-5 opacity-65" />
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={onAddClick}
                className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  hasSyncKey 
                    ? 'bg-black text-white hover:bg-black/90 shadow-sm' 
                    : 'bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-95'
                }`}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{t.addTransaction}</span>
              </button>

              {hasSyncKey && (
                <button
                  onClick={() => onSyncClick()}
                  disabled={syncLoading}
                  className="w-full py-2 bg-black/5 hover:bg-black/10 text-black border border-black/15 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
                  <span>{language === 'bn' ? 'এখন সিঙ্ক করুন' : 'Sync Now'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Local / Offline Status Card */}
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 flex flex-col justify-between h-full min-h-[130px]">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">
                {language === 'bn' ? 'অফলাইন মোড সক্রিয়' : 'Offline Mode Active'}
              </span>
              <div className="w-2.5 h-2.5 bg-[#00FF66] rounded-full shadow-[0_0_10px_#00FF66] animate-pulse" />
            </div>
            <p className="text-xs leading-snug text-slate-500 dark:text-slate-400 font-medium mt-3">
              {language === 'bn' 
                ? 'সকল হিসাব আপনার ডিভাইসে নিরাপদে সেভড। দ্রুত এবং শতভাগ বিশ্বস্ত পারফরম্যান্স।' 
                : 'All account entries remain client-side for immediate performance, offline security, and zero tracking.'
              }
            </p>
          </div>

        </div>

      </div>

      {/* 2. Transactions Table Card */}
      <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-3xl shadow-md overflow-hidden mt-8">
        
        {/* Table Toolbar Header */}
        <div className="p-5 md:p-6 border-b border-slate-100 dark:border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <span>{t.transactions}</span>
              <span className="px-2.5 py-0.5 text-xs bg-slate-900 dark:bg-[#00FF66] text-white dark:text-black rounded-md font-mono font-black">
                {sortedTransactions.length}
              </span>
            </h3>

            {/* Excel Export & Settings toolbar */}
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleExportCSV}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{t.exportExcel}</span>
              </button>
            </div>
          </div>

          {/* Search, Filters and Sorting Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            {/* Search Input */}
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium focus:outline-none focus:border-slate-400 dark:focus:border-[#00FF66] focus:ring-1 focus:ring-slate-400 dark:focus:ring-[#00FF66] transition"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-700 dark:text-white focus:outline-none"
            >
              <option value="all">{language === 'bn' ? 'সব ধরন' : 'All Types'}</option>
              <option value="income">{t.totalIncome}</option>
              <option value="expense">{t.totalExpense}</option>
            </select>

            {/* Sort Control */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-700 dark:text-white focus:outline-none"
            >
              <option value="date-desc">{language === 'bn' ? 'তারিখ (নতুন আগে)' : 'Date (Newest First)'}</option>
              <option value="date-asc">{language === 'bn' ? 'তারিখ (পুরোনো আগে)' : 'Date (Oldest First)'}</option>
              <option value="amount-desc">{language === 'bn' ? 'টাকার পরিমাণ (উচ্চ)' : 'Amount (High to Low)'}</option>
              <option value="amount-asc">{language === 'bn' ? 'টাকার পরিমাণ (নিম্ন)' : 'Amount (Low to High)'}</option>
            </select>
          </div>
        </div>

        {/* Transactions Table List */}
        {sortedTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 italic text-sm">
            {language === 'bn' ? 'কোন লেনদেনের তথ্য পাওয়া যায়নি।' : 'No transaction records found.'}
          </div>
        ) : (
          <>
            {/* Desktop View Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-white/5 text-slate-400 dark:text-gray-400 text-xs font-black uppercase tracking-widest border-b border-slate-100 dark:border-white/10">
                    <th className="px-6 py-4">{t.category}</th>
                    <th className="px-6 py-4">{t.description}</th>
                    <th className="px-6 py-4">{t.date}</th>
                    <th className="px-6 py-4 text-right">{t.amount}</th>
                    <th className="px-6 py-4 text-center">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  <AnimatePresence>
                    {sortedTransactions.map((tx) => {
                      // Match category for color & icon
                      const catDetail = categories.find(c => {
                        const isBnMatch = c.name_bn === tx.category;
                        const isEnMatch = c.name_en === tx.category || c.name === tx.category;
                        return isBnMatch || isEnMatch;
                      });
                      const catColor = catDetail?.color || '#94A3B8';
                      const catIcon = catDetail?.icon || 'HelpCircle';

                      return (
                        <motion.tr
                          key={tx.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-slate-50/70 dark:hover:bg-white/5 border-b border-slate-100/60 dark:border-white/5 transition group"
                        >
                          {/* Category Name & Pill */}
                          <td className="px-6 py-4.5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <span 
                                className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 shadow-sm transition-transform group-hover:scale-105"
                                style={{ 
                                  backgroundColor: `${catColor}15`, 
                                  borderColor: `${catColor}30`,
                                  color: catColor 
                                }}
                              >
                                <LucideIcon name={catIcon} size={18} />
                              </span>
                              <span className="text-sm font-black text-slate-800 dark:text-white tracking-tight">
                                {tx.category}
                              </span>
                            </div>
                          </td>

                          {/* Description */}
                          <td className="px-6 py-4.5 text-sm font-bold text-slate-600 dark:text-slate-300 max-w-xs truncate">
                            {tx.description || <span className="italic text-slate-300 dark:text-zinc-700">—</span>}
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4.5 whitespace-nowrap text-xs text-slate-400 dark:text-gray-500 font-mono font-bold tracking-wider">
                            {new Date(tx.date).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })}
                          </td>

                          {/* Amount */}
                          <td className="px-6 py-4.5 whitespace-nowrap text-right font-black font-mono">
                            <span className={`text-base tracking-tight ${
                              tx.type === 'income' 
                                ? 'text-emerald-600 dark:text-[#00FF66]' 
                                : 'text-red-500 dark:text-[#FF3B3B]'
                            }`}>
                              {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                            </span>
                          </td>

                          {/* Action buttons (Edit & Delete) */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                              <button
                                onClick={() => onEditClick(tx)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteClick(tx.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile View Card List */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-white/5">
              <AnimatePresence>
                {sortedTransactions.map((tx) => {
                  const catDetail = categories.find(c => {
                    const isBnMatch = c.name_bn === tx.category;
                    const isEnMatch = c.name_en === tx.category || c.name === tx.category;
                    return isBnMatch || isEnMatch;
                  });
                  const catColor = catDetail?.color || '#94A3B8';
                  const catIcon = catDetail?.icon || 'HelpCircle';

                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 dark:hover:bg-white/5 transition"
                    >
                      {/* Top Row: Icon, Title, Amount */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span 
                            className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 shadow-sm"
                            style={{ 
                              backgroundColor: `${catColor}15`, 
                              borderColor: `${catColor}30`,
                              color: catColor 
                            }}
                          >
                            <LucideIcon name={catIcon} size={18} />
                          </span>
                          <div>
                            <span className="text-sm font-black text-slate-800 dark:text-white tracking-tight block">
                              {tx.category}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-400 dark:text-gray-500">
                              {new Date(tx.date).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                                year: 'numeric', month: 'short', day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right font-black font-mono">
                          <span className={`text-base tracking-tight ${
                            tx.type === 'income' 
                              ? 'text-emerald-600 dark:text-[#00FF66]' 
                              : 'text-red-500 dark:text-[#FF3B3B]'
                          }`}>
                            {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Middle Row: Description */}
                      {tx.description && (
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                          {tx.description}
                        </p>
                      )}

                      {/* Bottom Row: Actions */}
                      <div className="flex items-center justify-end gap-2 border-t border-slate-100/50 dark:border-white/5 pt-2">
                        <button
                          onClick={() => onEditClick(tx)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 transition cursor-pointer flex items-center gap-1 active:scale-95"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>{language === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                        </button>
                        <button
                          onClick={() => onDeleteClick(tx.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100/40 dark:border-red-900/30 text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400 transition cursor-pointer flex items-center gap-1 active:scale-95"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{language === 'bn' ? 'মুছুন' : 'Delete'}</span>
                        </button>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}

      </div>

    </div>
  );
}
