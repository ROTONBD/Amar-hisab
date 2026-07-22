/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Calendar, CreditCard, AlignLeft, Info } from 'lucide-react';
import { Category, Transaction, Subscriber } from '../types';
import { translations } from '../utils/language';
import LucideIcon from './LucideIcon';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }) => void;
  transactionToEdit: Transaction | null;
  categories: Category[];
  language: 'bn' | 'en';
  currency: string;
  themeColor: 'emerald' | 'indigo' | 'amber' | 'rose' | 'slate';
  subscribers?: Subscriber[];
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  transactionToEdit,
  categories,
  language,
  currency,
  themeColor,
  subscribers = []
}: TransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [subscriberId, setSubscriberId] = useState('');
  const [error, setError] = useState('');

  const t = translations[language];

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmount(transactionToEdit.amount.toString());
      setCategory(transactionToEdit.category);
      setDate(transactionToEdit.date);
      setDescription(transactionToEdit.description);
      setSubscriberId(transactionToEdit.subscriberId || '');
    } else {
      // Set defaults for new transaction
      setType('expense');
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().slice(0, 10));
      setDescription('');
      setSubscriberId('');
    }
    setError('');
  }, [transactionToEdit, isOpen]);

  // Filter categories by type
  const filteredCategories = categories.filter(cat => cat.type === type);

  // Set first category as default when type changes
  useEffect(() => {
    if (!transactionToEdit && filteredCategories.length > 0) {
      setCategory(filteredCategories[0].name_bn || filteredCategories[0].name || '');
    }
  }, [type, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(t.errorAmount);
      return;
    }

    if (!category) {
      setError(t.errorCategory);
      return;
    }

    onSave({
      id: transactionToEdit?.id,
      type,
      amount: parsedAmount,
      category,
      date,
      description,
      subscriberId: subscriberId || undefined
    });
    
    onClose();
  };

  // Theme styling helpers
  const getButtonThemeClass = () => {
    switch (themeColor) {
      case 'indigo': return 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';
      case 'amber': return 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500';
      case 'rose': return 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-500';
      case 'slate': return 'bg-slate-700 hover:bg-slate-800 focus:ring-slate-600';
      default: return 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/10">
              <h3 className="text-xl font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                {transactionToEdit ? t.editTransaction : t.addTransaction}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Type Switcher (Income vs Expense Toggle) */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    type === 'expense'
                      ? 'bg-[#FF3B3B] text-white shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4 stroke-[2.5px]" />
                  <span>{t.totalExpense}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    type === 'income'
                      ? 'bg-[#00FF66] text-black shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Plus className="w-4 h-4 stroke-[2.5px]" />
                  <span>{t.totalIncome}</span>
                </button>
              </div>

              {/* Amount Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                  {t.amount}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400 dark:text-slate-500">
                    {currency}
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-2xl font-black text-slate-800 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-700 focus:outline-none focus:border-slate-900 dark:focus:border-[#00FF66] focus:ring-1 focus:ring-slate-900 dark:focus:ring-[#00FF66] transition"
                    autoFocus
                  />
                </div>
              </div>

              {/* Grid for Category and Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                    {t.categories}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-slate-900 dark:focus:border-[#00FF66] focus:ring-1 focus:ring-slate-900 dark:focus:ring-[#00FF66] transition cursor-pointer"
                  >
                    <option value="" disabled className="text-slate-500">{t.selectCategory}</option>
                    {filteredCategories.map((cat) => {
                      const displayName = language === 'bn' && cat.name_bn ? cat.name_bn : cat.name;
                      return (
                        <option key={cat.id} value={displayName} className="dark:bg-black dark:text-white font-bold">
                          {displayName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Date Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                    {t.date}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-slate-900 dark:focus:border-[#00FF66] focus:ring-1 focus:ring-slate-900 dark:focus:ring-[#00FF66] transition cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Subscriber Linking */}
              {type === 'income' && subscribers.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                    {language === 'bn' ? 'গ্রাহক লিংক করুন (ঐচ্ছিক)' : 'Link Subscriber (Optional)'}
                  </label>
                  <select
                    value={subscriberId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSubscriberId(val);
                      // Auto populate amount and description if empty/default
                      if (val) {
                        const sub = subscribers.find(s => s.id === val);
                        if (sub) {
                          if (!amount || amount === '0') {
                            setAmount(sub.monthlyBill.toString());
                          }
                          if (!description || description.trim() === '') {
                            setDescription(
                              language === 'bn'
                                ? `মাসিক বিল - ${sub.name} (${sub.packageName})`
                                : `Monthly bill - ${sub.name} (${sub.packageName})`
                            );
                          }
                        }
                      }
                    }}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-slate-900 dark:focus:border-[#00FF66] focus:ring-1 focus:ring-slate-900 dark:focus:ring-[#00FF66] transition cursor-pointer"
                  >
                    <option value="" className="text-slate-500">-- {language === 'bn' ? 'গ্রাহক নির্বাচন করুন' : 'Select Subscriber'} --</option>
                    {subscribers.map((sub) => (
                      <option key={sub.id} value={sub.id} className="dark:bg-black dark:text-white font-bold">
                        {sub.name} ({sub.mobile}) - {sub.packageName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                  {t.description}
                </label>
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: দুপুরের খাবার, বাইক ফুয়েল ইত্যাদি...' : 'e.g. Office lunch, bike fuel, utilities...'}
                    rows={2}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-slate-900 dark:focus:border-[#00FF66] focus:ring-1 focus:ring-slate-900 dark:focus:ring-[#00FF66] transition resize-none"
                  />
                </div>
              </div>

              {/* Quick Category Visual Icons Grid for Fast Tap selection */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 block">
                  {language === 'bn' ? 'সহজে ক্যাটাগরি সিলেক্ট করুন' : 'Tap to select category'}
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto p-1.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                  {filteredCategories.map((cat) => {
                    const displayName = language === 'bn' && cat.name_bn ? cat.name_bn : cat.name;
                    const isSelected = category === displayName;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(displayName)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition active:scale-95 border cursor-pointer ${
                          isSelected
                            ? 'bg-slate-950 text-white dark:bg-white dark:text-black border-slate-950 dark:border-white'
                            : 'bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-350 dark:hover:border-slate-700'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 flex items-center justify-center rounded-full" style={{ color: cat.color }}>
                          <LucideIcon name={cat.icon} size={14} />
                        </span>
                        <span>{displayName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-1.5 text-xs text-red-500 font-bold">
                  <Info className="w-3.5 h-3.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition duration-200 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-slate-950 text-white dark:bg-[#00FF66] dark:text-black rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:opacity-90 transition duration-200 cursor-pointer"
                >
                  {t.save}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
