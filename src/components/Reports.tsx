/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { ChevronLeft, ChevronRight, Calendar, AlertTriangle, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';
import { Category, Transaction } from '../types';
import { translations } from '../utils/language';

interface ReportsProps {
  transactions: Transaction[];
  categories: Category[];
  language: 'bn' | 'en';
  currency: string;
  themeColor: 'emerald' | 'indigo' | 'amber' | 'rose' | 'slate';
}

export default function Reports({
  transactions,
  categories,
  language,
  currency,
  themeColor
}: ReportsProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const t = translations[language];

  // Prevent hydration/sizing mismatches in Recharts
  useEffect(() => {
    setMounted(true);
  }, []);

  const changeMonth = (increment: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setSelectedDate(newDate);
  };

  const getMonthName = (date: Date) => {
    if (language === 'bn') {
      const bnMonths = [
        'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
        'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
      ];
      return `${bnMonths[date.getMonth()]} ${date.getFullYear().toLocaleString('bn-BD', { useGrouping: false })}`;
    }
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  // Filter transactions for selected month & year
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate.getFullYear() === year && txDate.getMonth() === month;
  });

  // Calculate totals
  const monthlyIncome = filteredTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const monthlyExpense = filteredTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netSavings = monthlyIncome - monthlyExpense;

  // 1. Group daily transactions for the Area Chart
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${formattedDay}`;
    
    const dayIncome = filteredTransactions
      .filter(tx => tx.type === 'income' && tx.date === dateStr)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const dayExpense = filteredTransactions
      .filter(tx => tx.type === 'expense' && tx.date === dateStr)
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      day: language === 'bn' ? day.toLocaleString('bn-BD') : day,
      Income: dayIncome,
      Expense: dayExpense
    };
  });

  // 2. Group expenses by category for the Pie Chart
  const expenseByCategory = filteredTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => {
    const categoryDetail = categories.find(c => {
      const isBnMatch = c.name_bn === name;
      const isEnMatch = c.name_en === name || c.name === name;
      return isBnMatch || isEnMatch;
    });
    return {
      name,
      value,
      color: categoryDetail?.color || '#94A3B8'
    };
  }).sort((a, b) => b.value - a.value);

  // Group incomes by category for visual card
  const incomeByCategory = filteredTransactions
    .filter(tx => tx.type === 'income')
    .reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

  // Theme styling helpers
  const getThemeTextClass = () => {
    switch (themeColor) {
      case 'indigo': return 'text-indigo-600 dark:text-indigo-400';
      case 'amber': return 'text-amber-600 dark:text-amber-400';
      case 'rose': return 'text-rose-600 dark:text-rose-400';
      case 'slate': return 'text-slate-700 dark:text-slate-300';
      default: return 'text-emerald-600 dark:text-emerald-400';
    }
  };

  const getThemeBadgeClass = () => {
    switch (themeColor) {
      case 'indigo': return 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40';
      case 'amber': return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/40';
      case 'rose': return 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/40';
      case 'slate': return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      default: return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40';
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      
      {/* Month Selector Card */}
      <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-3xl p-4 flex justify-between items-center shadow-sm">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/10 transition active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Calendar className={`w-5 h-5 text-slate-900 dark:text-[#00FF66]`} />
          <span className="text-base md:text-lg font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
            {getMonthName(selectedDate)}
          </span>
        </div>

        <button
          onClick={() => changeMonth(1)}
          className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/10 transition active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200/60 dark:border-white/10">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {t.noData}
          </h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            {language === 'bn' 
              ? 'ড্যাশবোর্ড থেকে নতুন আয়ের বা ব্যয়ের তথ্য যোগ করুন এবং এখানে এসে স্বয়ংক্রিয় গ্রাফিক্যাল অ্যানালাইসিস দেখুন।'
              : 'Add some income or expense entries from the dashboard to see an interactive visualization.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Monthly Summaries Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Income Summary Card */}
            <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">{t.totalIncome}</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-[#00FF66]">{currency} {monthlyIncome.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-white/5 text-emerald-600 dark:text-[#00FF66] rounded-2xl border border-emerald-100/40 dark:border-white/10">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            {/* Expense Summary Card */}
            <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">{t.totalExpense}</span>
                <p className="text-2xl font-black text-red-600 dark:text-[#FF3B3B]">{currency} {monthlyExpense.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-white/5 text-red-600 dark:text-[#FF3B3B] rounded-2xl border border-red-100/40 dark:border-white/10">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>

            {/* Cash Flow Balance Summary Card */}
            <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">{t.cashFlow}</span>
                <p className={`text-2xl font-black ${netSavings >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-500'}`}>
                  {currency} {netSavings.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-2xl border ${
                netSavings >= 0 
                  ? 'bg-blue-50 dark:bg-white/5 text-blue-600 dark:text-blue-400 border-blue-100/40 dark:border-white/10' 
                  : 'bg-amber-50 dark:bg-white/5 text-amber-600 dark:text-amber-400 border-amber-100/40 dark:border-white/10'
              }`}>
                {netSavings >= 0 ? <Sparkles className="w-6 h-6 animate-pulse" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
            </div>

          </div>

          {/* Warning Indicator if Expense > Income */}
          {netSavings < 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 flex gap-3 text-amber-800 dark:text-amber-300 text-sm"
            >
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
              <div>
                <span className="font-bold">{t.budgetAlert}</span>{' '}
                {language === 'bn' 
                  ? 'এই মাসে আপনার মোট খরচ আয়ের সীমা অতিক্রম করেছে। একটু সাশ্রয়ী হবার চেষ্টা করুন!' 
                  : 'Your monthly expenses have crossed your income limit. Keep an eye on non-essential spending!'}
              </div>
            </motion.div>
          )}

          {/* Charts Layout - Flow and Category Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Area Chart: Income vs Expense Over Time */}
            <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
              <div>
                <h4 className="text-base font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">{t.incomeVsExpense}</h4>
                <p className="text-xs text-slate-400">{language === 'bn' ? 'তারিখ ভিত্তিক নগদ প্রবাহের বিশ্লেষণ' : 'Day-by-day cash flow analysis'}</p>
              </div>
              <div className="h-72 w-full text-xs font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00FF66" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00FF66" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF3B3B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FF3B3B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#6B7280" fontSize={10} tickLine={false} />
                    <YAxis stroke="#6B7280" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#000000', 
                        borderColor: 'rgba(255,255,255,0.1)', 
                        borderRadius: '12px',
                        color: '#FFFFFF'
                      }} 
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Area type="monotone" dataKey="Income" stroke="#00FF66" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" name={t.totalIncome} />
                    <Area type="monotone" dataKey="Expense" stroke="#FF3B3B" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" name={t.totalExpense} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Category Expenses Breakdown */}
            <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
              <div>
                <h4 className="text-base font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">{t.categoryAnalysis}</h4>
                <p className="text-xs text-slate-400">{language === 'bn' ? 'ক্যাটাগরি ভিত্তিক মোট খরচের অনুপাত' : 'Category proportion of total expense'}</p>
              </div>
              
              {pieData.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm italic">
                  {language === 'bn' ? 'এই মাসে ব্যয়ের কোন হিসাব নেই।' : 'No expense records found.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="h-56 w-full text-xs font-sans">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => `${currency} ${value.toLocaleString()}`}
                          contentStyle={{ 
                            backgroundColor: '#000000', 
                            borderColor: 'rgba(255,255,255,0.1)', 
                            borderRadius: '12px',
                            color: '#FFFFFF'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pie Legend / List */}
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {pieData.map((item, index) => {
                      const percent = monthlyExpense > 0 ? Math.round((item.value / monthlyExpense) * 100) : 0;
                      return (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[100px]">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2 font-mono">
                            <span className="text-slate-800 dark:text-slate-100 font-semibold">{currency}{item.value.toLocaleString()}</span>
                            <span className="text-slate-400 text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">{percent}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Income Source Split */}
          {Object.keys(incomeByCategory).length > 0 && (
            <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-6 shadow-sm space-y-3">
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {language === 'bn' ? 'আয়ের উৎস সমূহ' : 'Income Sources'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(incomeByCategory).map(([catName, val], i) => {
                  const cat = categories.find(c => c.name_bn === catName || c.name_en === catName || c.name === catName);
                  return (
                    <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat?.color || '#10B981' }} />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{catName}</span>
                      </div>
                      <span className="text-sm font-black text-emerald-600 dark:text-[#00FF66] font-mono">+{currency}{val.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
