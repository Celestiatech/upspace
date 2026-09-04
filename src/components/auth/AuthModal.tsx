'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  AtSign,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ThemeMode } from '@/types/theme';
import { useAuth } from './AuthProvider';

interface AuthModalProps {
  theme: ThemeMode;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({
  theme,
  initialMode = 'signin',
  onClose,
  onSuccess,
}: AuthModalProps) {
  const isDay = theme === 'day';
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithMagicLink,
    signInDemoUser,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle Sign In (Email + Password)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const res = await signInWithEmail(email, password);
    setIsLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg('Welcome back! Signed in successfully.');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 600);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const res = await signUpWithEmail(email, password, {
      name: name.trim() || email.split('@')[0],
      username: cleanUsername || email.split('@')[0].toLowerCase(),
    });
    setIsLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.requiresVerification) {
      setSuccessMsg('Account created! Please check your email to confirm your account.');
    } else {
      setSuccessMsg('Welcome to UpSpace! Account created successfully.');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 600);
    }
  };

  // Handle Google OAuth
  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      await signInWithGoogle();
    } catch (e: any) {
      setIsLoading(false);
      setErrorMsg(e?.message || 'Google Sign-In was cancelled or failed.');
    }
  };

  // Handle Magic Link / Passwordless
  const handleMagicLink = async () => {
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address to receive a magic link.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    const res = await signInWithMagicLink(email);
    setIsLoading(false);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg(`Magic login link sent to ${email}! Check your inbox.`);
    }
  };

  // Handle Instant Citizen Guest / Demo
  const handleDemoSignIn = () => {
    signInDemoUser();
    setSuccessMsg('Signed in as Guest Citizen!');
    setTimeout(() => {
      onSuccess?.();
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <section
        className={`w-full max-w-md rounded-[1.8rem] sm:rounded-[2.2rem] p-4 sm:p-7 border shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[92vh] ${
          isDay
            ? 'bg-white/95 border-slate-200/90 text-slate-950 shadow-slate-900/20'
            : 'bg-slate-950/95 border-white/15 text-white shadow-black/80'
        }`}
      >
        {/* MODAL HEADER */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>UpSpace Citizen Access</span>
            </div>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              {mode === 'signin' ? 'Sign In to Account' : 'Create Citizen Account'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition hover:scale-105 active:scale-95 touch-manipulation"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>


        {/* TABS SWITCHER */}
        <div className="flex rounded-2xl p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 mt-4 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
              mode === 'signin'
                ? isDay
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
              mode === 'signup'
                ? isDay
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* ALERTS / NOTICES */}
        <div className="space-y-2 mt-3">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* BODY & FORMS */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 custom-scrollbar">
          {/* 1. GOOGLE ONE-CLICK SIGN IN */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className={`w-full py-2.5 px-4 rounded-xl sm:rounded-2xl border font-black text-xs flex items-center justify-center gap-3 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 touch-manipulation ${
              isDay
                ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-900 shadow-sm'
                : 'bg-white/5 hover:bg-white/10 border-white/15 text-white shadow-sm'
            }`}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* DIVIDER */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              or continue with email
            </span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
          </div>

          {/* SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3">
              {/* EMAIL */}
              <div>
                <label className="text-xs font-black text-slate-900 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-orange-600 dark:text-cyan-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className={`w-full px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold border outline-none transition ${
                    isDay
                      ? 'bg-slate-50 border-slate-300 focus:border-slate-900 text-slate-950 placeholder:text-slate-400'
                      : 'bg-white/5 border-white/10 focus:border-cyan-400 text-white placeholder:text-slate-500'
                  }`}
                />
              </div>

              {/* PASSWORD */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-orange-600 dark:text-cyan-400" />
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleMagicLink}
                    className="text-[11px] font-bold text-orange-600 dark:text-cyan-400 hover:underline touch-manipulation"
                  >
                    Magic link?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`w-full pl-3.5 pr-10 py-2 sm:py-2.5 rounded-xl text-xs font-bold border outline-none transition ${
                      isDay
                        ? 'bg-slate-50 border-slate-300 focus:border-slate-900 text-slate-950 placeholder:text-slate-400'
                        : 'bg-white/5 border-white/10 focus:border-cyan-400 text-white placeholder:text-slate-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 touch-manipulation"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* SIGN IN BUTTON */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 sm:py-3 px-5 mt-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 touch-manipulation"
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In to UpSpace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              {/* FULL NAME */}
              <div>
                <label className="text-xs font-black text-slate-900 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-orange-600 dark:text-cyan-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className={`w-full px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold border outline-none transition ${
                    isDay
                      ? 'bg-slate-50 border-slate-300 focus:border-slate-900 text-slate-950 placeholder:text-slate-400'
                      : 'bg-white/5 border-white/10 focus:border-cyan-400 text-white placeholder:text-slate-500'
                  }`}
                />
              </div>

              {/* USERNAME */}
              <div>
                <label className="text-xs font-black text-slate-900 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <AtSign className="w-3.5 h-3.5 text-orange-600 dark:text-cyan-400" />
                  Citizen Handle (@)
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                  }
                  placeholder="alexvance"
                  className={`w-full px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-mono font-bold border outline-none transition ${
                    isDay
                      ? 'bg-slate-50 border-slate-300 focus:border-slate-900 text-slate-950 placeholder:text-slate-400'
                      : 'bg-white/5 border-white/10 focus:border-cyan-400 text-white placeholder:text-slate-500'
                  }`}
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="text-xs font-black text-slate-900 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-orange-600 dark:text-cyan-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className={`w-full px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold border outline-none transition ${
                    isDay
                      ? 'bg-slate-50 border-slate-300 focus:border-slate-900 text-slate-950 placeholder:text-slate-400'
                      : 'bg-white/5 border-white/10 focus:border-cyan-400 text-white placeholder:text-slate-500'
                  }`}
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-xs font-black text-slate-900 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-orange-600 dark:text-cyan-400" />
                  Create Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className={`w-full pl-3.5 pr-10 py-2 sm:py-2.5 rounded-xl text-xs font-bold border outline-none transition ${
                      isDay
                        ? 'bg-slate-50 border-slate-300 focus:border-slate-900 text-slate-950 placeholder:text-slate-400'
                        : 'bg-white/5 border-white/10 focus:border-cyan-400 text-white placeholder:text-slate-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 touch-manipulation"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* SIGN UP BUTTON */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 sm:py-3 px-5 mt-2 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-600 hover:from-cyan-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-cyan-600/25 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 touch-manipulation"
              >
                <span>{isLoading ? 'Creating Account...' : 'Create Citizen Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* INSTANT DEMO GUEST ACCESS */}
          <div className="pt-2 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 dark:border-white/20 hover:border-cyan-500 dark:hover:border-cyan-400 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center justify-center gap-2 transition touch-manipulation"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Instant Guest Citizen Demo Access</span>
            </button>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="pt-2.5 sm:pt-3 border-t border-slate-200 dark:border-white/10 shrink-0 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>End-to-End Encrypted Auth &amp; Verified Ownership</span>
          </div>
        </div>
      </section>
    </div>
  );
}
