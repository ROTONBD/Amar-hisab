/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, Unlock, Eye, EyeOff, Globe, Sparkles } from 'lucide-react';
import { Security } from '../types';
import { hashPassword } from '../utils/crypto';
import { translations } from '../utils/language';

interface PasswordLockProps {
  security: Security;
  onUnlock: () => void;
  language: 'bn' | 'en';
  setLanguage: (lang: 'bn' | 'en') => void;
  themeColor: 'emerald' | 'indigo' | 'amber' | 'rose' | 'slate';
}

export default function PasswordLock({
  security,
  onUnlock,
  language,
  setLanguage,
  themeColor
}: PasswordLockProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const t = translations[language];

  // Map theme colors to CSS
  const getThemeGradient = () => {
    return 'from-[#00FF66] to-[#0A0A0A]';
  };

  const getThemeAccentClass = () => {
    return 'bg-white hover:opacity-90 text-black border border-white';
  };

  const getThemeTextClass = () => {
    return 'text-[#00FF66]';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    const hashed = await hashPassword(password, security.salt || '');
    if (hashed === security.passwordHash) {
      onUnlock();
    } else {
      setError(t.passwordIncorrect);
      setIsShaking(true);
      setPassword('');
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  // Add keypad button support
  const handleKeypadPress = (num: string) => {
    setError('');
    setPassword(prev => prev + num);
  };

  const handleBackspace = () => {
    setPassword(prev => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-6 relative overflow-hidden font-sans">
      {/* Decorative ambient background glows */}
      <div className={`absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br ${getThemeGradient()} opacity-25 rounded-full blur-3xl`} />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-950 to-slate-950 opacity-15 rounded-full blur-3xl" />

      {/* Top Header Row */}
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-5 h-5 ${getThemeTextClass()}`} />
          <span className="font-black text-xl uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            {t.appName}
          </span>
        </div>
        
        {/* Language Toggle */}
        <button
          onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 transition text-xs font-black uppercase tracking-widest text-slate-300 cursor-pointer"
        >
          <Globe className="w-4 h-4" />
          <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
        </button>
      </div>

      {/* Main Lock Screen Content */}
      <div className="flex-1 flex flex-col justify-center items-center max-w-md w-full mx-auto z-10">
        <motion.div
          animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="w-full text-center"
        >
          {/* Animated Lock Icon */}
          <div className="mb-6 flex justify-center">
            <div className="p-5 rounded-full bg-white/5 border border-white/10 shadow-xl relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${getThemeGradient()} opacity-20 rounded-full blur-md`} />
              <Lock className={`w-10 h-10 ${getThemeTextClass()} animate-pulse`} />
            </div>
          </div>

          <h2 className="text-3xl font-black uppercase tracking-wider text-white mb-2">
            {t.appLocked}
          </h2>
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">
            {t.enterPassword}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4 mb-6">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setError('');
                  setPassword(e.target.value);
                }}
                placeholder="••••••"
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-center text-2xl tracking-widest text-white focus:outline-none focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] transition"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm font-bold"
              >
                {error}
              </motion.p>
            )}

            {security.hint && (
              <p className="text-xs text-slate-400 bg-white/5 py-1.5 px-3 rounded-lg border border-white/10 inline-block font-bold uppercase tracking-wide">
                💡 {t.passwordHint}: <span className="text-[#00FF66] italic">{security.hint}</span>
              </p>
            )}

            <button
              type="submit"
              className={`w-full py-4 rounded-2xl text-lg font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition duration-200 cursor-pointer ${getThemeAccentClass()}`}
            >
              <Unlock className="w-5 h-5 stroke-[2.5px]" />
              <span>{t.unlockBtn}</span>
            </button>
          </form>

          {/* Graphical Keypad for Fast Accessibility */}
          <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto mt-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadPress(num)}
                className="w-16 h-16 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 active:scale-95 text-xl font-black text-slate-250 transition flex items-center justify-center mx-auto cursor-pointer"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="col-start-2 w-16 h-16 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 active:scale-95 text-xl font-black text-slate-250 transition flex items-center justify-center mx-auto cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="w-16 h-16 rounded-full bg-red-950/20 border border-red-900/30 hover:bg-red-900/45 active:scale-95 text-sm font-black text-red-400 transition flex items-center justify-center mx-auto cursor-pointer"
            >
              ⌫
            </button>
          </div>
        </motion.div>
      </div>

      {/* Footer Branding */}
      <div className="text-center z-10 text-[10px] uppercase tracking-widest text-slate-600 font-bold mt-4">
        🔒 {t.appSubtitle} &bull; End-to-End Encrypted
      </div>
    </div>
  );
}
