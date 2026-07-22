/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Plus, Search, Edit2, Trash2, Phone, Wifi, CheckCircle, 
  XCircle, Filter, DollarSign, FileText, ChevronDown, ChevronUp, Clock, AlertCircle, ShoppingBag,
  MessageSquare, Copy, Send, Share2, Check
} from 'lucide-react';
import { Subscriber, Transaction, SMSTemplate } from '../types';

interface SubscribersProps {
  subscribers: Subscriber[];
  transactions: Transaction[];
  onAddSubscriber: (newSub: Omit<Subscriber, 'id' | 'createdAt'>) => void;
  onEditSubscriber: (id: string, updatedSub: Partial<Subscriber>) => void;
  onDeleteSubscriber: (id: string) => void;
  language: 'bn' | 'en';
  currency: string;
  smsTemplates?: SMSTemplate[];
  onAddSmsTemplate?: (newTpl: Omit<SMSTemplate, 'id'>) => void;
  onEditSmsTemplate?: (id: string, updatedTpl: Partial<SMSTemplate>) => void;
  onDeleteSmsTemplate?: (id: string) => void;
}

export default function Subscribers({
  subscribers = [],
  transactions = [],
  onAddSubscriber,
  onEditSubscriber,
  onDeleteSubscriber,
  language,
  currency,
  smsTemplates = [],
  onAddSmsTemplate = () => {},
  onEditSmsTemplate = () => {},
  onDeleteSmsTemplate = () => {}
}: SubscribersProps) {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscriber | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formPackage, setFormPackage] = useState('');
  const [formBill, setFormBill] = useState(500);
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formNotes, setFormNotes] = useState('');

  // SMS Template Subtab & Form States
  const [subTab, setSubTab] = useState<'list' | 'templates'>('list');
  const [isTplModalOpen, setIsTplModalOpen] = useState(false);
  const [editingTpl, setEditingTpl] = useState<SMSTemplate | null>(null);
  const [tplTitle, setTplTitle] = useState('');
  const [tplBody, setTplBody] = useState('');
  const [tplType, setTplType] = useState<'payment' | 'due' | 'welcome' | 'custom'>('custom');

  // Selected Subscriber Message Generator States
  const [selectedTplId, setSelectedTplId] = useState<string>('');
  const [messagePreview, setMessagePreview] = useState<string>('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Template Body Variable Replacer
  const parseTemplateBody = (body: string, sub: Subscriber): string => {
    if (!body || !sub) return '';
    const now = new Date();
    const formattedDate = language === 'bn' 
      ? `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`
      : now.toLocaleDateString();
      
    return body
      .replace(/{name}/g, sub.name)
      .replace(/{mobile}/g, sub.mobile)
      .replace(/{package}/g, sub.packageName)
      .replace(/{bill}/g, sub.monthlyBill.toLocaleString())
      .replace(/{currency}/g, currency)
      .replace(/{date}/g, formattedDate);
  };

  // Synchronize message preview when selected subscriber or selected template changes
  useEffect(() => {
    const activeSub = subscribers.find(s => s.id === selectedSubId);
    if (activeSub) {
      const activeTpl = smsTemplates.find(tpl => tpl.id === selectedTplId) || smsTemplates[0];
      if (activeTpl) {
        setSelectedTplId(activeTpl.id);
        setMessagePreview(parseTemplateBody(activeTpl.body, activeSub));
      } else {
        setMessagePreview('');
      }
    } else {
      setMessagePreview('');
    }
    setCopiedSuccess(false);
  }, [selectedSubId, selectedTplId, smsTemplates, subscribers]);

  // Translations
  const t = {
    title: language === 'bn' ? 'গ্রাহক তালিকা' : 'Subscriber List',
    subtitle: language === 'bn' ? 'আপনার ইন্টারনেট ও ওয়াইফাই নেটওয়ার্কের গ্রাহক ও পেমেন্ট ম্যানেজমেন্ট' : 'Internet & WiFi network subscribers & billing logs',
    addSubscriber: language === 'bn' ? 'নতুন গ্রাহক যুক্ত করুন' : 'Add New Subscriber',
    editSubscriber: language === 'bn' ? 'গ্রাহক তথ্য সংশোধন' : 'Edit Subscriber Info',
    searchPlaceholder: language === 'bn' ? 'গ্রাহকের নাম, মোবাইল বা প্যাকেজ দিয়ে খুঁজুন...' : 'Search by name, mobile, package...',
    statusAll: language === 'bn' ? 'সব গ্রাহক' : 'All Subscribers',
    statusActive: language === 'bn' ? 'সক্রিয় গ্রাহক' : 'Active Subscribers',
    statusInactive: language === 'bn' ? 'নিষ্ক্রিয় গ্রাহক' : 'Inactive Subscribers',
    totalSubs: language === 'bn' ? 'মোট গ্রাহক' : 'Total Subscribers',
    activeSubs: language === 'bn' ? 'সক্রিয় সংযোগ' : 'Active Connections',
    expectedRev: language === 'bn' ? 'মাসিক সম্ভাব্য বিল' : 'Expected Monthly Bills',
    collectedThisMonth: language === 'bn' ? 'চলতি মাসে আদায়' : 'Collected This Month',
    noSubscribers: language === 'bn' ? 'কোন গ্রাহকের তথ্য পাওয়া যায়নি।' : 'No subscriber records found.',
    name: language === 'bn' ? 'গ্রাহকের নাম' : 'Subscriber Name',
    mobile: language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number',
    package: language === 'bn' ? 'ইন্টারনেট প্যাকেজ' : 'Internet Package',
    bill: language === 'bn' ? 'মাসিক বিলের পরিমাণ' : 'Monthly Bill Amount',
    status: language === 'bn' ? 'সংযোগের স্থিতি' : 'Connection Status',
    notes: language === 'bn' ? 'অতিরিক্ত নোট (ঐচ্ছিক)' : 'Extra Notes (Optional)',
    actions: language === 'bn' ? 'অ্যাকশন' : 'Actions',
    active: language === 'bn' ? 'সক্রিয়' : 'Active',
    inactive: language === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive',
    requiredFields: language === 'bn' ? 'অনুগ্রহ করে সব তথ্য দিন' : 'Please fill all required fields',
    historyTitle: language === 'bn' ? 'পেমেন্ট ও লেনদেন ইতিহাস' : 'Payment & Transaction Logs',
    noHistory: language === 'bn' ? 'এই গ্রাহকের কোন লেনদেনের রেকর্ড নেই।' : 'No transactions recorded for this subscriber.',
    linkPrompt: language === 'bn' ? 'লেনদেন করার সময় এই গ্রাহককে সিলেক্ট করতে পারবেন।' : 'Link to payments directly when creating transactions.',
    cancel: language === 'bn' ? 'বাতিল' : 'Cancel',
    save: language === 'bn' ? 'সংরক্ষণ করুন' : 'Save'
  };

  // Preset packages for easy filling
  const presetPackages = [
    { name: '5 Mbps - Home Starter', bill: 400 },
    { name: '10 Mbps - Family Net', bill: 500 },
    { name: '20 Mbps - Super Fast', bill: 800 },
    { name: '30 Mbps - Business Pro', bill: 1200 },
    { name: '50 Mbps - Fiber Ultimate', bill: 2000 },
    { name: 'Hotspot Ticket - Daily/Hourly', bill: 50 }
  ];

  // Calculated Stats
  const totalSubscribersCount = subscribers.length;
  const activeSubscribersCount = subscribers.filter(s => s.status === 'active').length;
  const expectedRevenueSum = subscribers.reduce((acc, s) => s.status === 'active' ? acc + s.monthlyBill : acc, 0);

  // Get total collections this month linked to subscribers
  const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
  const totalCollectedThisMonth = transactions
    .filter(tx => {
      const isCollection = tx.type === 'income' && (tx.category === 'গ্রাহক মাসিক বিল' || tx.category === 'Subscriber Monthly Bill' || tx.category.toLowerCase().includes('bill'));
      const isCurrentMonth = tx.date.startsWith(currentMonthStr);
      return isCollection && isCurrentMonth;
    })
    .reduce((acc, tx) => acc + tx.amount, 0);

  // Filtered Subscriber list
  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = 
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.mobile.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.packageName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && sub.status === statusFilter;
  });

  const openAddModal = () => {
    setEditingSub(null);
    setFormName('');
    setFormMobile('');
    setFormPackage('');
    setFormBill(500);
    setFormStatus('active');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (sub: Subscriber) => {
    setEditingSub(sub);
    setFormName(sub.name);
    setFormMobile(sub.mobile);
    setFormPackage(sub.packageName);
    setFormBill(sub.monthlyBill);
    setFormStatus(sub.status);
    setFormNotes(sub.notes || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formMobile || !formPackage || formBill <= 0) {
      alert(t.requiredFields);
      return;
    }

    if (editingSub) {
      onEditSubscriber(editingSub.id, {
        name: formName,
        mobile: formMobile,
        packageName: formPackage,
        monthlyBill: formBill,
        status: formStatus,
        notes: formNotes
      });
    } else {
      onAddSubscriber({
        name: formName,
        mobile: formMobile,
        packageName: formPackage,
        monthlyBill: formBill,
        status: formStatus,
        notes: formNotes
      });
    }
    setIsModalOpen(false);
  };

  const handleTplSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplTitle || !tplBody) {
      alert(language === 'bn' ? 'টেমপ্লেটের নাম ও মেসেজ বডি দিন।' : 'Please fill template title and body.');
      return;
    }

    if (editingTpl) {
      onEditSmsTemplate(editingTpl.id, {
        title: tplTitle,
        body: tplBody,
        type: tplType
      });
    } else {
      onAddSmsTemplate({
        title: tplTitle,
        body: tplBody,
        type: tplType
      });
    }
    setIsTplModalOpen(false);
  };

  // Get subscriber transactions
  const getSubscriberTransactions = (subId: string) => {
    return transactions.filter(tx => tx.subscriberId === subId || tx.description.includes(subId));
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#00FF66]" />
            {t.title}
          </h2>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
            {t.subtitle}
          </p>
        </div>
        {subTab === 'list' ? (
          <button
            onClick={openAddModal}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#00FF66] text-black hover:bg-[#00E55C] font-black uppercase tracking-wider text-xs transition-all shadow-md shadow-[#00FF66]/10 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {t.addSubscriber}
          </button>
        ) : (
          <button
            onClick={() => {
              setEditingTpl(null);
              setTplTitle('');
              setTplBody('');
              setTplType('custom');
              setIsTplModalOpen(true);
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#00FF66] text-black hover:bg-[#00E55C] font-black uppercase tracking-wider text-xs transition-all shadow-md shadow-[#00FF66]/10 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {language === 'bn' ? 'নতুন টেমপ্লেট তৈরি' : 'Create Template'}
          </button>
        )}
      </div>

      {/* Inner Sub-navigation tabs */}
      <div className="flex border-b border-slate-200 dark:border-white/10 gap-6">
        <button
          onClick={() => setSubTab('list')}
          className={`pb-3 text-xs sm:text-sm font-black uppercase tracking-wider transition relative cursor-pointer ${
            subTab === 'list'
              ? 'text-slate-900 dark:text-white border-b-2 border-[#00FF66]'
              : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
          }`}
        >
          {language === 'bn' ? 'গ্রাহক ও পেমেন্ট তালিকা' : 'Subscribers & Payments'}
        </button>
        <button
          onClick={() => setSubTab('templates')}
          className={`pb-3 text-xs sm:text-sm font-black uppercase tracking-wider transition relative cursor-pointer ${
            subTab === 'templates'
              ? 'text-slate-900 dark:text-white border-b-2 border-[#00FF66]'
              : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
          }`}
        >
          {language === 'bn' ? 'এসএমএস ও বার্তা টেমপ্লেট' : 'SMS & Custom Templates'}
        </button>
      </div>

      {subTab === 'list' ? (
        <>
          {/* KPI Cards Bento Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total subscribers */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-white/5 p-4 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest block">{t.totalSubs}</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{totalSubscribersCount.toLocaleString()}</span>
            <span className="text-xs text-slate-400 dark:text-gray-500 font-bold">{language === 'bn' ? 'জন' : 'subs'}</span>
          </div>
          <Users className="absolute right-3 bottom-3 w-10 h-10 text-slate-100 dark:text-white/5 -z-0 pointer-events-none" />
        </div>

        {/* Active subscribers */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-white/5 p-4 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest block">{t.activeSubs}</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-black text-[#00FF66]">{activeSubscribersCount.toLocaleString()}</span>
            <span className="text-xs text-emerald-500 dark:text-emerald-400 font-bold">{language === 'bn' ? 'সংযোগ' : 'active'}</span>
          </div>
          <CheckCircle className="absolute right-3 bottom-3 w-10 h-10 text-slate-100 dark:text-white/5 -z-0 pointer-events-none" />
        </div>

        {/* Expected Billing revenue */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-white/5 p-4 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest block">{t.expectedRev}</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-black text-amber-500 dark:text-amber-400">{currency}{expectedRevenueSum.toLocaleString()}</span>
            <span className="text-xs text-slate-400 dark:text-gray-500 font-bold">/{language === 'bn' ? 'মাস' : 'mo'}</span>
          </div>
          <DollarSign className="absolute right-3 bottom-3 w-10 h-10 text-slate-100 dark:text-white/5 -z-0 pointer-events-none" />
        </div>

        {/* Total Collected This Month */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-white/5 p-4 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest block">{t.collectedThisMonth}</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-black text-[#00FF66]">{currency}{totalCollectedThisMonth.toLocaleString()}</span>
            <span className="text-xs text-[#00FF66]/80 font-bold">{language === 'bn' ? 'আদায়' : 'recv'}</span>
          </div>
          <FileText className="absolute right-3 bottom-3 w-10 h-10 text-slate-100 dark:text-white/5 -z-0 pointer-events-none" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-white/5 p-4 rounded-3xl flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="w-full md:flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] transition"
          />
        </div>

        {/* Filter Controls */}
        <div className="w-full md:w-auto flex items-center gap-1.5 overflow-x-auto bg-slate-50 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/60 dark:border-white/10">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition shrink-0 cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-black shadow'
                : 'text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            {t.statusAll}
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition shrink-0 cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-black shadow'
                : 'text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            {t.statusActive}
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition shrink-0 cursor-pointer ${
              statusFilter === 'inactive'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-black shadow'
                : 'text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            {t.statusInactive}
          </button>
        </div>
      </div>

      {/* Main Subscriber List Grid and Detail View */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Subscribers list - Takes 2/3 space on big screen */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-white/5 rounded-3xl overflow-hidden xl:col-span-2">
          
          {filteredSubscribers.length === 0 ? (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500 font-semibold italic text-sm">
              {t.noSubscribers}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-white/5 text-slate-400 dark:text-gray-400 text-xs font-black uppercase tracking-widest border-b border-slate-100 dark:border-white/10">
                      <th className="px-6 py-4">{t.name}</th>
                      <th className="px-6 py-4">{t.package}</th>
                      <th className="px-6 py-4 text-right">{t.bill}</th>
                      <th className="px-6 py-4 text-center">{t.status}</th>
                      <th className="px-6 py-4 text-center">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    <AnimatePresence>
                      {filteredSubscribers.map((sub) => (
                        <motion.tr
                          key={sub.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setSelectedSubId(selectedSubId === sub.id ? null : sub.id)}
                          className={`hover:bg-slate-50/70 dark:hover:bg-white/5 border-b border-slate-100/60 dark:border-white/5 transition group cursor-pointer ${
                            selectedSubId === sub.id ? 'bg-slate-50/90 dark:bg-white/5 border-l-4 border-l-[#00FF66]' : ''
                          }`}
                        >
                          {/* Name & Contact */}
                          <td className="px-6 py-4.5 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-800 dark:text-white tracking-tight">
                                {sub.name}
                              </span>
                              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono font-bold flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-slate-300 dark:text-zinc-600" />
                                {sub.mobile}
                              </span>
                            </div>
                          </td>

                          {/* Package */}
                          <td className="px-6 py-4.5 text-sm font-bold text-slate-600 dark:text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <Wifi className="w-4 h-4 text-slate-400" />
                              {sub.packageName}
                            </span>
                          </td>

                          {/* Monthly Bill */}
                          <td className="px-6 py-4.5 whitespace-nowrap text-right font-black font-mono">
                            <span className="text-slate-800 dark:text-white text-base">
                              {currency}{sub.monthlyBill.toLocaleString()}
                            </span>
                          </td>

                          {/* Connection Status Pill */}
                          <td className="px-6 py-4.5 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              sub.status === 'active' 
                                ? 'bg-emerald-50 dark:bg-emerald-950/35 text-emerald-600 dark:text-[#00FF66]' 
                                : 'bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400'
                            }`}>
                              {sub.status === 'active' ? (
                                <><CheckCircle className="w-3 h-3" /> {t.active}</>
                              ) : (
                                <><XCircle className="w-3 h-3" /> {t.inactive}</>
                              )}
                            </span>
                          </td>

                          {/* Action controls */}
                          <td className="px-6 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                              <button
                                onClick={() => openEditModal(sub)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteSubscriber(sub.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Mobile View Card List */}
              <div className="block md:hidden divide-y divide-slate-100 dark:divide-white/5">
                <AnimatePresence>
                  {filteredSubscribers.map((sub) => (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onClick={() => setSelectedSubId(selectedSubId === sub.id ? null : sub.id)}
                      className={`p-4 flex flex-col gap-3 hover:bg-slate-50/50 dark:hover:bg-white/5 transition cursor-pointer ${
                        selectedSubId === sub.id ? 'bg-slate-50/50 dark:bg-white/5 border-l-4 border-l-[#00FF66]' : ''
                      }`}
                    >
                      {/* Top Row Name & Bill */}
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-sm font-black text-slate-800 dark:text-white tracking-tight block">
                            {sub.name}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono font-bold flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {sub.mobile}
                          </span>
                        </div>
                        <span className="text-base font-black font-mono text-slate-800 dark:text-white">
                          {currency}{sub.monthlyBill.toLocaleString()}
                        </span>
                      </div>

                      {/* Middle Row Package & Status */}
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Wifi className="w-3.5 h-3.5 text-slate-400" />
                          {sub.packageName}
                        </span>

                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          sub.status === 'active' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/35 text-emerald-600 dark:text-[#00FF66]' 
                            : 'bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400'
                        }`}>
                          {sub.status === 'active' ? t.active : t.inactive}
                        </span>
                      </div>

                      {/* Action buttons stack */}
                      <div className="flex items-center justify-end gap-2 border-t border-slate-100/50 dark:border-white/5 pt-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => openEditModal(sub)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 transition cursor-pointer flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>{language === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                        </button>
                        <button
                          onClick={() => onDeleteSubscriber(sub.id)}
                          className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100/40 dark:border-red-900/30 text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 transition cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{language === 'bn' ? 'মুছুন' : 'Delete'}</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}

        </div>

        {/* Selected Subscriber detail sidebar profile - Takes 1/3 space */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-white/5 rounded-3xl p-5 space-y-5">
          {selectedSubId ? (() => {
            const selectedSub = subscribers.find(s => s.id === selectedSubId);
            if (!selectedSub) return null;

            const subHistory = getSubscriberTransactions(selectedSub.id);

            return (
              <div className="space-y-4">
                
                {/* Subscriber Profile Header */}
                <div className="text-center pb-4 border-b border-slate-100 dark:border-white/5">
                  <div className="w-16 h-16 rounded-3xl bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/25 flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{selectedSub.name}</h3>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-0.5">{selectedSub.packageName}</p>
                </div>

                {/* Sub Metadata List */}
                <div className="space-y-3.5 text-xs font-bold">
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.mobile}</span>
                    <span className="text-slate-700 dark:text-slate-200 font-mono select-all flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {selectedSub.mobile}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.bill}</span>
                    <span className="text-slate-900 dark:text-white font-black">{currency}{selectedSub.monthlyBill.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.status}</span>
                    <span className={selectedSub.status === 'active' ? 'text-[#00FF66]' : 'text-red-500'}>
                      {selectedSub.status === 'active' ? t.active : t.inactive}
                    </span>
                  </div>
                  {selectedSub.notes && (
                    <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/10 mt-2">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">{t.notes}</span>
                      <p className="text-slate-600 dark:text-slate-300 font-bold leading-relaxed">{selectedSub.notes}</p>
                    </div>
                  )}
                </div>

                {/* Subscriber Payments & Billing Ledger History */}
                <div className="border-t border-slate-100 dark:border-white/5 pt-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-gray-400 flex items-center gap-1.5 mb-3">
                    <Clock className="w-3.5 h-3.5 text-[#00FF66]" />
                    {t.historyTitle}
                  </h4>

                  {subHistory.length === 0 ? (
                    <p className="text-center text-[11px] text-slate-400 italic py-5 bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200/50 dark:border-white/5 rounded-2xl">
                      {t.noHistory}
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {subHistory.map((tx) => (
                        <div key={tx.id} className="p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-100/50 dark:border-white/5 rounded-xl flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-800 dark:text-white max-w-[140px] truncate">{tx.category}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{tx.date}</span>
                          </div>
                          <span className={`text-xs font-black font-mono ${
                            tx.type === 'income' ? 'text-emerald-500 dark:text-[#00FF66]' : 'text-red-500'
                          }`}>
                            {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SMS & Messaging Panel */}
                <div className="border-t border-slate-100 dark:border-white/5 pt-4 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-gray-400 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#00FF66]" />
                    {language === 'bn' ? 'বার্তা টেমপ্লেট পাঠান' : 'Send Message Template'}
                  </h4>

                  {smsTemplates.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic py-2">
                      {language === 'bn' ? 'কোন টেমপ্লেট তৈরি করা হয়নি।' : 'No templates created yet.'}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {/* Select Template Dropdown */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          {language === 'bn' ? 'টেমপ্লেট নির্বাচন করুন' : 'Select Template'}
                        </label>
                        <select
                          value={selectedTplId}
                          onChange={(e) => setSelectedTplId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200/60 dark:border-white/10 text-xs font-semibold focus:outline-none focus:border-[#00FF66] transition cursor-pointer"
                        >
                          {smsTemplates.map(tpl => (
                            <option key={tpl.id} value={tpl.id} className="dark:bg-zinc-900 text-xs text-slate-800 dark:text-white">
                              {tpl.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Live Edit / Preview Box */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                            {language === 'bn' ? 'মেসেজ প্রিভিউ (সম্পাদনযোগ্য)' : 'Message Preview (Editable)'}
                          </label>
                          {copiedSuccess && (
                            <span className="text-[10px] text-[#00FF66] animate-pulse lowercase font-bold">
                              {language === 'bn' ? '✓ কপি হয়েছে!' : '✓ copied!'}
                            </span>
                          )}
                        </div>
                        <textarea
                          value={messagePreview}
                          onChange={(e) => setMessagePreview(e.target.value)}
                          rows={4}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/60 dark:border-white/10 text-xs font-bold font-sans focus:outline-none focus:border-[#00FF66] resize-y leading-relaxed text-slate-700 dark:text-slate-300"
                        />
                      </div>

                      {/* Messaging Buttons Stack */}
                      <div className="grid grid-cols-3 gap-2">
                        {/* Copy button */}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(messagePreview);
                            setCopiedSuccess(true);
                            setTimeout(() => setCopiedSuccess(false), 2000);
                          }}
                          className="px-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 border border-slate-200/20 dark:border-white/5 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                          title={language === 'bn' ? 'কপি করুন' : 'Copy'}
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>{language === 'bn' ? 'কপি করুন' : 'Copy'}</span>
                        </button>

                        {/* WhatsApp Button */}
                        <button
                          onClick={() => {
                            let cleanNum = selectedSub.mobile.replace(/\D/g, '');
                            if (cleanNum.startsWith('0')) {
                              cleanNum = '88' + cleanNum;
                            } else if (!cleanNum.startsWith('88') && cleanNum.length === 10) {
                              cleanNum = '880' + cleanNum;
                            }
                            const waUrl = `https://api.whatsapp.com/send?phone=${cleanNum}&text=${encodeURIComponent(messagePreview)}`;
                            window.open(waUrl, '_blank');
                          }}
                          className="px-2 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600/25 dark:hover:bg-emerald-600/35 text-[10px] font-black uppercase tracking-wider text-white dark:text-emerald-400 border border-emerald-500/20 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 animate-bounce" />
                          <span>{language === 'bn' ? 'হোয়াটসঅ্যাপ' : 'WhatsApp'}</span>
                        </button>

                        {/* SMS Button */}
                        <button
                          onClick={() => {
                            const cleanNum = selectedSub.mobile.replace(/\D/g, '');
                            const smsUrl = `sms:${cleanNum}?body=${encodeURIComponent(messagePreview)}`;
                            window.location.href = smsUrl;
                          }}
                          className="px-2 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 dark:bg-blue-600/25 dark:hover:bg-blue-600/35 text-[10px] font-black uppercase tracking-wider text-white dark:text-blue-400 border border-blue-500/20 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                          <span>{language === 'bn' ? 'এসএমএস' : 'SMS'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 italic bg-blue-50/50 dark:bg-blue-950/10 p-3 rounded-2xl border border-blue-100/30 dark:border-blue-900/10 flex gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{t.linkPrompt}</span>
                </div>

              </div>
            );
          })() : (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium italic text-xs flex flex-col items-center justify-center gap-2">
              <Users className="w-10 h-10 text-slate-300 dark:text-zinc-800 animate-pulse" />
              <span>{language === 'bn' ? 'যেকোনো গ্রাহকের ওপর ক্লিক করে বিস্তারিত তথ্য ও পেমেন্ট হিস্ট্রি দেখুন।' : 'Click on any subscriber to load details and billing history.'}</span>
            </div>
          )}
        </div>

      </div>
        </>
      ) : (
        /* SMS Template Manager Section */
        <div className="space-y-6">
          {/* Information Notice Card */}
          <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-white/5 p-5 rounded-3xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/25 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                {language === 'bn' ? 'কাস্টম মেসেজ ও এসএমএস টেমপ্লেট গাইড' : 'Custom Message & SMS Template Guide'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                {language === 'bn'
                  ? 'গ্রাহককে মেসেজ বা বকেয়া রিমাইন্ডার পাঠানোর জন্য টেমপ্লেট তৈরি করুন। মেসেজ ডাইনামিক করতে নিম্নোক্ত ভেরিয়েবলগুলো ব্যবহার করতে পারেন:'
                  : 'Create templates for customer billing notifications. Use the following variables to make them dynamic:'}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-2 py-1 rounded-lg bg-slate-250 dark:bg-white/5 font-mono text-[10px] text-slate-700 dark:text-slate-300 font-bold">
                  {`{name}`} - {language === 'bn' ? 'গ্রাহকের নাম' : 'Customer Name'}
                </span>
                <span className="px-2 py-1 rounded-lg bg-slate-250 dark:bg-white/5 font-mono text-[10px] text-slate-700 dark:text-slate-300 font-bold">
                  {`{package}`} - {language === 'bn' ? 'প্যাকেজের নাম' : 'Package Name'}
                </span>
                <span className="px-2 py-1 rounded-lg bg-slate-250 dark:bg-white/5 font-mono text-[10px] text-slate-700 dark:text-slate-300 font-bold">
                  {`{bill}`} - {language === 'bn' ? 'বিলের পরিমাণ' : 'Bill Amount'}
                </span>
                <span className="px-2 py-1 rounded-lg bg-slate-250 dark:bg-white/5 font-mono text-[10px] text-slate-700 dark:text-slate-300 font-bold">
                  {`{currency}`} - {language === 'bn' ? 'মুদ্রা প্রতীক' : 'Currency Symbol'}
                </span>
                <span className="px-2 py-1 rounded-lg bg-slate-250 dark:bg-white/5 font-mono text-[10px] text-slate-700 dark:text-slate-300 font-bold">
                  {`{date}`} - {language === 'bn' ? 'বর্তমান তারিখ' : 'Current Date'}
                </span>
                <span className="px-2 py-1 rounded-lg bg-slate-250 dark:bg-white/5 font-mono text-[10px] text-slate-700 dark:text-slate-300 font-bold">
                  {`{mobile}`} - {language === 'bn' ? 'গ্রাহক মোবাইল' : 'Customer Mobile'}
                </span>
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          {smsTemplates.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-white/5 rounded-3xl">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-zinc-800 mx-auto mb-3 animate-pulse" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                {language === 'bn' ? 'কোন টেমপ্লেট নেই। নতুন টেমপ্লেট তৈরি করুন!' : 'No templates found. Please create one!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {smsTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-white/5 rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-[#00FF66]/5 dark:hover:shadow-[#00FF66]/2 transition relative group overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        tpl.type === 'payment'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-[#00FF66]'
                          : tpl.type === 'due'
                          ? 'bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400'
                          : tpl.type === 'welcome'
                          ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-500 dark:text-blue-400'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                      }`}>
                        {tpl.type === 'payment'
                          ? (language === 'bn' ? 'রসিদ' : 'Receipt')
                          : tpl.type === 'due'
                          ? (language === 'bn' ? 'বকেয়া বিল' : 'Due Notice')
                          : tpl.type === 'welcome'
                          ? (language === 'bn' ? 'সংযোগ বার্তা' : 'Welcome')
                          : (language === 'bn' ? 'কাস্টম' : 'Custom')}
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => {
                            setEditingTpl(tpl);
                            setTplTitle(tpl.title);
                            setTplBody(tpl.body);
                            setTplType(tpl.type);
                            setIsTplModalOpen(true);
                          }}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteSmsTemplate(tpl.id)}
                          className="p-1 rounded bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 text-red-500 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-tight leading-snug">
                      {tpl.title}
                    </h3>

                    <div className="bg-slate-50 dark:bg-zinc-950 rounded-2xl p-3.5 border border-slate-150/45 dark:border-white/5">
                      <p className="text-[11px] font-sans font-bold text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {tpl.body}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span>{language === 'bn' ? 'ভেরিয়েবল সমর্থিত' : 'Variables supported'}</span>
                    <span className="font-mono text-slate-300 dark:text-zinc-700">#{tpl.id.substring(4, 8)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Creation and Modification Form Modal Popup overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-[#0E0E0E] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                <h3 className="text-base font-black uppercase tracking-wider text-slate-800 dark:text-white">
                  {editingSub ? t.editSubscriber : t.addSubscriber}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition cursor-pointer text-slate-400"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                
                {/* Subscriber Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-gray-400 block">{t.name}</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={language === 'bn' ? 'উদা: আতিকুর রহমান' : 'e.g. Atikur Rahman'}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] transition"
                  />
                </div>

                {/* Mobile / Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-gray-400 block">{t.mobile}</label>
                  <input
                    type="tel"
                    required
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                    placeholder="e.g. 01700000000"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] transition font-mono"
                  />
                </div>

                {/* Preset Packages Helper for Speed-dial */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-gray-400 block">
                    {language === 'bn' ? 'প্যাকেজ ডায়াল (সহজ নির্বাচন)' : 'Speed Select Package'}
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto pr-1">
                    {presetPackages.map((pkg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormPackage(pkg.name);
                          setFormBill(pkg.bill);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-200/40 dark:border-white/5 hover:border-[#00FF66] bg-slate-50 dark:bg-white/5 text-[10px] font-bold text-left truncate transition text-slate-600 dark:text-slate-300 active:scale-95 cursor-pointer"
                      >
                        {pkg.name} ({currency}{pkg.bill})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Package Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-gray-400 block">{t.package}</label>
                    <input
                      type="text"
                      required
                      value={formPackage}
                      onChange={(e) => setFormPackage(e.target.value)}
                      placeholder="e.g. 10 Mbps"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] transition"
                    />
                  </div>

                  {/* Monthly Bill */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-gray-400 block">{t.bill}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">{currency}</span>
                      <input
                        type="number"
                        required
                        value={formBill}
                        onChange={(e) => setFormBill(Number(e.target.value))}
                        className="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-sm font-semibold focus:outline-none focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] transition font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Connection status and toggling */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-gray-400 block">{t.status}</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-sm font-semibold focus:outline-none focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] transition"
                    >
                      <option value="active">{t.active}</option>
                      <option value="inactive">{t.inactive}</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-gray-400 block">{t.notes}</label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-sm font-semibold focus:outline-none focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] transition resize-none"
                  />
                </div>

                {/* Form CTA Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-2xl bg-[#00FF66] text-black hover:bg-[#00E55C] font-black uppercase tracking-wider text-xs shadow-md shadow-[#00FF66]/10 active:scale-95 cursor-pointer"
                  >
                    {t.save}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}

        {isTplModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-[#0E0E0E] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                <h3 className="text-base font-black uppercase tracking-wider text-slate-800 dark:text-white">
                  {editingTpl 
                    ? (language === 'bn' ? 'টেমপ্লেট সম্পাদনা' : 'Edit Template') 
                    : (language === 'bn' ? 'নতুন টেমপ্লেট তৈরি' : 'Create Template')}
                </h3>
                <button
                  onClick={() => setIsTplModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition cursor-pointer text-slate-400"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleTplSubmit} className="p-6 space-y-4">
                {/* Template Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-gray-400 block">
                    {language === 'bn' ? 'টেমপ্লেটের নাম' : 'Template Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={tplTitle}
                    onChange={(e) => setTplTitle(e.target.value)}
                    placeholder={language === 'bn' ? 'উদা: মাসিক বিল রিমাইন্ডার' : 'e.g. Monthly Due Reminder'}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] transition"
                  />
                </div>

                {/* Template Type selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-gray-400 block">
                    {language === 'bn' ? 'ধরণ (Type)' : 'Type'}
                  </label>
                  <select
                    value={tplType}
                    onChange={(e) => setTplType(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-sm font-semibold focus:outline-none focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] transition"
                  >
                    <option value="payment">{language === 'bn' ? 'রসিদ (Receipt)' : 'Receipt'}</option>
                    <option value="due">{language === 'bn' ? 'বকেয়া বিল (Due Notice)' : 'Due Notice'}</option>
                    <option value="welcome">{language === 'bn' ? 'সংযোগ বার্তা (Welcome Notice)' : 'Welcome Notice'}</option>
                    <option value="custom">{language === 'bn' ? 'কাস্টম (Custom)' : 'Custom'}</option>
                  </select>
                </div>

                {/* Template Body Textarea */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-gray-400 block">
                      {language === 'bn' ? 'মেসেজ বডি (Message Body)' : 'Message Body'}
                    </label>
                    <span className="text-[10px] text-slate-450 font-mono font-black lowercase">
                      {language === 'bn' ? 'সাপোর্টেড: {name}, {package}, {bill}, {currency}, {date}, {mobile}' : 'Supports: {name}, {package}, {bill}, {currency}, {date}, {mobile}'}
                    </span>
                  </div>
                  <textarea
                    required
                    value={tplBody}
                    onChange={(e) => setTplBody(e.target.value)}
                    rows={5}
                    placeholder={language === 'bn' ? "প্রিয় {name},\nআপনার {package} সংযোগের বিল {currency}{bill} বকেয়া রয়েছে। অনুগ্রহ করে পরিশোধ করুন।" : "Dear {name},\nYour monthly bill of {currency}{bill} for package {package} is due. Please pay."}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#000] border border-slate-200/60 dark:border-white/10 text-sm font-semibold placeholder-slate-450 focus:outline-none focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] transition leading-relaxed"
                  />
                </div>

                {/* Form CTA Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsTplModalOpen(false)}
                    className="px-4 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-2xl bg-[#00FF66] text-black hover:bg-[#00E55C] font-black uppercase tracking-wider text-xs shadow-md shadow-[#00FF66]/10 active:scale-95 cursor-pointer"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
