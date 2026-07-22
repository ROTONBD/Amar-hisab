/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Tag, Trash2, Palette, Smile, Sparkles, Check } from 'lucide-react';
import { Category } from '../types';
import { translations, themeColors } from '../utils/language';
import LucideIcon from './LucideIcon';

interface CategoriesProps {
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
  language: 'bn' | 'en';
  themeColor: 'emerald' | 'indigo' | 'amber' | 'rose' | 'slate';
}

export default function Categories({
  categories,
  onAddCategory,
  onDeleteCategory,
  language,
  themeColor
}: CategoriesProps) {
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [color, setColor] = useState('#3B82F6');
  const [icon, setIcon] = useState('Tag');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const t = translations[language];

  const presetColors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', 
    '#EC4899', '#14B8A6', '#6366F1', '#F43F5E', '#06B6D4', 
    '#64748B', '#22C55E', '#D946EF', '#84CC16', '#F97316'
  ];

  const presetIcons = [
    'Wifi', 'Server', 'Cpu', 'Zap', 'Wrench', 'Layers', 'Ticket', 'Box', 'Globe', 'Database',
    'Phone', 'CreditCard', 'ShoppingBag', 'Briefcase', 'TrendingUp', 'LineChart', 'Laptop', 'Gift', 'DollarSign', 'Tag'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const nameToUse = language === 'bn' ? nameBn : nameEn;
    if (!nameBn.trim() || !nameEn.trim()) {
      setError(language === 'bn' ? 'দয়া করে বাংলা এবং ইংরেজি উভয় নামই পূরণ করুন।' : 'Please fill both Bangla and English names.');
      return;
    }

    onAddCategory({
      name_bn: nameBn.trim(),
      name_en: nameEn.trim(),
      name: nameToUse.trim(),
      type,
      icon,
      color
    } as any);

    setNameBn('');
    setNameEn('');
    setColor('#3B82F6');
    setIcon('Tag');
    setIsAdding(false);
  };

  const incomes = categories.filter(c => c.type === 'income');
  const expenses = categories.filter(c => c.type === 'expense');

  const currentTheme = themeColors[themeColor] || themeColors.emerald;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header and Add button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Tag className={`w-5 h-5 ${currentTheme.textClass}`} />
            <span>{t.categories}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn' ? 'আলাদা আলাদা খাত বা ক্যাটাগরি সমূহ' : 'Track and manage ledger transaction groups'}
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow transition active:scale-95 cursor-pointer hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'ক্যাটাগরি যোগ করুন' : 'Add Category'}</span>
        </button>
      </div>

      {/* Add Custom Category Form Dropdown */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-md"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Bangla Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                  {language === 'bn' ? 'বাংলা নাম' : 'Bangla Name'}
                </label>
                <input
                  type="text"
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  placeholder="যেমন: চিকিৎসা"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-[#00FF66]"
                  required
                />
              </div>

              {/* English Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                  {language === 'bn' ? 'ইংরেজি নাম' : 'English Name'}
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Medical"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-[#00FF66]"
                  required
                />
              </div>

              {/* Type Switcher */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">{t.type}</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                      type === 'expense' 
                        ? 'bg-red-500 text-white shadow' 
                        : 'text-slate-500'
                    }`}
                  >
                    {t.totalExpense}
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                      type === 'income' 
                        ? 'bg-[#00FF66] text-black shadow' 
                        : 'text-slate-500'
                    }`}
                  >
                    {t.totalIncome}
                  </button>
                </div>
              </div>

            </div>

            {/* Custom Icon Palette Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1">
                <Smile className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'আইকন সিলেক্ট করুন' : 'Select Icon'}</span>
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                {presetIcons.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition active:scale-95 border cursor-pointer ${
                      icon === ic
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-black dark:border-white'
                        : 'bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300'
                    }`}
                  >
                    <LucideIcon name={ic} size={16} />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Palette Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1">
                <Palette className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'রং সিলেক্ট করুন' : 'Select Color'}</span>
              </label>
              <div className="flex flex-wrap gap-2.5 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                {presetColors.map((col, idx) => (
                  <button
                    key={`${col}-${idx}`}
                    type="button"
                    onClick={() => setColor(col)}
                    className="w-6 h-6 rounded-full transition active:scale-95 shadow-sm flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: col }}
                  >
                    {color === col && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-red-500 font-bold">{error}</p>}

            {/* Action buttons */}
            <div className="flex gap-2.5 pt-1.5 justify-end">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-5 py-2.5 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 dark:bg-[#00FF66] text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer hover:opacity-95"
              >
                {t.save}
              </button>
            </div>

          </form>
        </motion.div>
      )}

      {/* Main Categories Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Income Categories */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-black text-emerald-600 dark:text-[#00FF66] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5" />
              <span>{t.totalIncome}</span>
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-widest font-bold">{language === 'bn' ? 'আয়ের খাত সমূহ' : 'Income pathways'}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {incomes.map((cat) => {
              const displayName = language === 'bn' && cat.name_bn ? cat.name_bn : cat.name;
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 relative group overflow-hidden"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                      <LucideIcon name={cat.icon} size={14} />
                    </span>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 truncate max-w-[80px]">
                      {displayName}
                    </span>
                  </div>
                  
                  {/* Delete custom categories if needed (we can hide/guard system categories from deletion) */}
                  {cat.id.startsWith('custom_') && (
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="absolute right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-black text-red-600 dark:text-[#FF3B3B] uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-4.5 h-4.5" />
              <span>{t.totalExpense}</span>
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-widest font-bold">{language === 'bn' ? 'ব্যয়ের খাত সমূহ' : 'Expenditure pathways'}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {expenses.map((cat) => {
              const displayName = language === 'bn' && cat.name_bn ? cat.name_bn : cat.name;
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 relative group overflow-hidden"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                      <LucideIcon name={cat.icon} size={14} />
                    </span>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 truncate max-w-[80px]">
                      {displayName}
                    </span>
                  </div>

                  {/* Delete custom categories */}
                  {cat.id.startsWith('custom_') && (
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="absolute right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
