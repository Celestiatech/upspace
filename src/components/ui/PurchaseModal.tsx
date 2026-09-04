'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Sparkles,
  X,
  Mail,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { FloorData, getDisplayFloorNumber } from '@/types/floor';
import { ThemeMode } from '@/types/theme';
import { useAppStore, AuthUser } from '@/store/useAppStore';

import { createClient } from '@/utils/supabase/browser';

interface PurchaseModalProps {
  floor: FloorData | null;
  floors: FloorData[];
  theme: ThemeMode;
  onClose: () => void;
  onConfirm: (campaign: { title: string; bannerUrl: string; targetUrl: string; bidAmount: number; claimCode: string }) => void;
}

export function PurchaseModal({ floor, floors, theme, onClose, onConfirm }: PurchaseModalProps) {
  // Global Zustand persistent Auth session
  const currentUser = useAppStore((state) => state.user);
  const login = useAppStore((state) => state.login);
  const logout = useAppStore((state) => state.logout);

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  
  // Auth Form Fields
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Floor Reservation states
  const [reserved, setReserved] = useState(false);
  const [adTitle, setAdTitle] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [bidAmount, setBidAmount] = useState(0);
  const [claimCode, setClaimCode] = useState('');

  // Sync with real Supabase Auth session
  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          login({
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Member',
            email: session.user.email || '',
            provider: session.user.app_metadata?.provider === 'google' ? 'google' : 'email',
          });
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          login({
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Member',
            email: session.user.email || '',
            provider: session.user.app_metadata?.provider === 'google' ? 'google' : 'email',
          });
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    } catch (e) {
      console.error('Supabase client error:', e);
    }
  }, [login]);

  useEffect(() => {
    if (!floor) return;
    setReserved(false);
    setAdTitle(floor.brandTitle || '');
    setBannerUrl(floor.adBannerUrl || '');
    setTargetUrl(floor.targetUrl || '');
    setBidAmount(floor.price);
    setClaimCode('');
    setAuthError('');
    setOtpSent(false);
  }, [floor]);

  if (!floor) return null;

  const displayNum = getDisplayFloorNumber(floor.floorNumber, floors.length);
  const isOutbid = floor.status === 'sold';

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Sign out error:', e);
    }
    logout();
  };

  // 1. REAL GOOGLE OAUTH WITH SUPABASE
  const handleRealGoogleAuth = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setAuthError(error.message);
        setAuthLoading(false);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Failed to initiate Google sign in.');
      setAuthLoading(false);
    }
  };

  // 2. REAL EMAIL & PASSWORD SUBMIT
  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!authEmail.trim()) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (!authPassword.trim() || authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setAuthLoading(true);
    try {
      const supabase = createClient();
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword.trim(),
        });
        if (error) {
          setAuthError(error.message);
        } else if (data?.user) {
          login({
            name: data.user.user_metadata?.full_name || authEmail.split('@')[0],
            email: data.user.email || authEmail.trim(),
            provider: 'email',
          });
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword.trim(),
          options: {
            data: { full_name: authName.trim() },
          },
        });
        if (error) {
          setAuthError(error.message);
        } else if (data?.user) {
          login({
            name: authName.trim() || authEmail.split('@')[0],
            email: data.user.email || authEmail.trim(),
            provider: 'email',
          });
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // 3. REAL SEND EMAIL OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!authEmail.trim() || !authEmail.includes('@')) {
      setAuthError('Please enter a valid email address to receive OTP.');
      return;
    }

    setAuthLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: authEmail.trim(),
        options: {
          shouldCreateUser: true,
        },
      });
      if (error) {
        setAuthError(error.message);
      } else {
        setOtpSent(true);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Failed to send OTP.');
    } finally {
      setAuthLoading(false);
    }
  };

  // 4. REAL VERIFY EMAIL OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!otpInput.trim()) {
      setAuthError('Please enter the OTP verification code.');
      return;
    }

    setAuthLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.verifyOtp({
        email: authEmail.trim(),
        token: otpInput.trim(),
        type: 'email',
      });
      if (error) {
        setAuthError(error.message);
      } else if (data?.user) {
        login({
          name: data.user.user_metadata?.full_name || authEmail.split('@')[0],
          email: data.user.email || authEmail.trim(),
          provider: 'otp',
        });
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Invalid OTP code.');
    } finally {
      setAuthLoading(false);
    }
  };

  // 5. GUEST SIGN-IN
  const handleGuestAuth = () => {
    setAuthLoading(true);
    setTimeout(() => {
      const guestId = Math.floor(1000 + Math.random() * 9000);
      login({
        id: `US-${guestId}`,
        username: `guest_${guestId}`,
        name: `Guest ${guestId}`,
        email: `guest_${guestId}@upspace.live`,
        provider: 'otp',
      });
      setAuthLoading(false);
    }, 400);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md animate-in fade-in duration-200 select-none ${theme === 'day' ? '' : 'dark'}`}>
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 text-slate-100 animate-in zoom-in-95 duration-200 border border-slate-200/80 dark:border-white/10 shadow-2xl bg-white/95 dark:bg-[#0b1024]/95 backdrop-blur-2xl">
        
        {/* STEP 1: AUTHENTICATION (Show first if not logged in) */}
        {false ? (
          <div className="space-y-6">
            {/* Modal Header */}
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                   LVL {displayNum}
                 </span>
                 <div>
                   <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                     Choose Sign-in Method
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Authenticate or continue as guest to reserve and mint this floor.
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition" aria-label="Close dialog">
                <X className="h-5 w-5" />
              </button>
            </header>

            {/* BIG LOGOS SELECTION GRID (Google, Email, Guest) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Real Google OAuth Tile */}
              <button
                type="button"
                onClick={handleRealGoogleAuth}
                disabled={authLoading}
                className="group relative flex flex-col items-center justify-center p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/90 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-850 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-center"
              >
                {/* Big Google Logo */}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-950 p-3 shadow-md border border-slate-200/80 dark:border-slate-800 group-hover:shadow-[0_0_16px_rgba(66,133,244,0.3)] transition-all">
                  <svg className="h-full w-full object-contain" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <span className="mt-3 text-sm font-black text-slate-900 dark:text-white">Google</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Real Google OAuth</span>
              </button>

              {/* Option 2: Big Email / OTP Tile */}
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('otp');
                  setAuthError('');
                }}
                className={`group relative flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-center ${
                  authMethod === 'otp' || authMethod === 'password'
                    ? 'border-cyan-500/80 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                    : 'border-slate-200/90 dark:border-white/10 bg-slate-50/90 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-850 hover:border-cyan-500/50'
                }`}
              >
                {/* Big Mail Logo */}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-3 shadow-md text-white group-hover:shadow-[0_0_16px_rgba(0,240,255,0.4)] transition-all">
                  <Mail className="h-7 w-7" strokeWidth={2.2} />
                </div>
                <span className="mt-3 text-sm font-black text-slate-900 dark:text-white">Email &amp; OTP</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Password or Real OTP</span>
              </button>

              {/* Option 3: Big Guest Tile */}
              <button
                type="button"
                onClick={handleGuestAuth}
                disabled={authLoading}
                className="group relative flex flex-col items-center justify-center p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/90 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-850 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-center"
              >
                {/* Big Guest Logo */}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 shadow-md text-white group-hover:shadow-[0_0_16px_rgba(16,185,129,0.4)] transition-all">
                  <User className="h-7 w-7" strokeWidth={2.2} />
                </div>
                <span className="mt-3 text-sm font-black text-slate-900 dark:text-white">Guest Access</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Instant Checkout</span>
              </button>
            </div>

            {/* Separator */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Email Sign-In Options</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            </div>

            {/* Method switcher: Password vs OTP */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900/90 p-1 border border-slate-200 dark:border-white/10">
              <button
                onClick={() => {
                  setAuthMethod('otp');
                  setAuthError('');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  authMethod === 'otp'
                    ? 'bg-white dark:bg-cyan-500 text-slate-900 dark:text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Real Email OTP Verification
              </button>
              <button
                onClick={() => {
                  setAuthMethod('password');
                  setAuthError('');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  authMethod === 'password'
                    ? 'bg-white dark:bg-cyan-500 text-slate-900 dark:text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Password Login
              </button>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-in fade-in">
                {authError}
              </div>
            )}

            {/* METHOD A: PASSWORD FORM */}
            {authMethod === 'password' && (
              <form onSubmit={handlePasswordAuth} className="space-y-3">
                {authMode === 'signup' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Full Name</label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Alex Vance"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                        required={authMode === 'signup'}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Password</label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-md transition hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {authLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  <span>{authMode === 'login' ? 'Sign In & Continue' : 'Create Account & Continue'}</span>
                </button>
              </form>
            )}

            {/* METHOD B: EMAIL OTP FORM */}
            {authMethod === 'otp' && (
              <div className="space-y-3">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Your Email</label>
                      <div className="relative flex items-center">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                        <input
                          type="email"
                          placeholder="alex@example.com"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-md transition hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      {authLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                      <span>Send Real 6-Digit OTP Email</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>OTP sent to: <b>{authEmail}</b></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpInput('');
                        }}
                        className="text-[10px] font-bold text-slate-500 hover:underline"
                      >
                        Change
                      </button>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Enter Code from Email</label>
                      <input
                        type="text"
                        maxLength={8}
                        placeholder="123456"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        className="w-full text-center tracking-[0.4em] text-base font-mono font-black py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                        required
                        autoFocus
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-md transition hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      {authLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      <span>Verify &amp; Continue</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Toggle Login vs Sign Up */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  setAuthError('');
                }}
                className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-cyan-500 transition"
              >
                {authMode === 'login' ? (
                  <span>Don&apos;t have an account? <b className="text-cyan-600 dark:text-cyan-400 underline">Sign Up</b></span>
                ) : (
                  <span>Already have an account? <b className="text-cyan-600 dark:text-cyan-400 underline">Log In</b></span>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: FLOOR RESERVE & MINTING FORM (Shown once user is authenticated) */
          !reserved ? (
            <form onSubmit={(event) => {
              event.preventDefault();
              const title = adTitle.trim();
              if (!title) return;
              if (!Number.isFinite(bidAmount) || bidAmount < floor.price) return;
              const generatedCode = `UPS-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${floor.floorNumber + 1}`;
              setClaimCode(generatedCode);
              onConfirm({ title, bannerUrl: bannerUrl.trim(), targetUrl: targetUrl.trim(), bidAmount, claimCode: generatedCode });
              setReserved(true);
            }}>
              {/* Header with User Info & Logout */}
              <header className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                    LVL {displayNum}
                  </span>
                  <div>
                    <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                      {isOutbid ? 'Outbid &amp; Reserve' : 'Claim &amp; Reserve'}
                    </h2>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span><b className="text-slate-900 dark:text-white font-bold">{currentUser?.email || 'Guest purchase'}</b></span>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="inline-flex items-center gap-0.5 text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
                        title="Sign Out"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition" aria-label="Close dialog">
                  <X className="h-4 w-4" />
                </button>
              </header>

              {/* Tower Specs Ribbon */}
              <div className="my-3.5 flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-white/[0.07] bg-slate-50 dark:bg-white/[0.045] p-3 text-xs">
                <div><span className="tech-label block">Elevation</span><span className="font-bold text-slate-800 dark:text-slate-200">{floor.elevationMeters}m</span></div>
                <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />
                <div><span className="tech-label block">Est. views</span><span className="font-bold text-slate-800 dark:text-slate-200">{floor.impressionsPerDay}</span></div>
                <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />
                <div><span className="tech-label block">Format</span><span className="block max-w-[90px] truncate font-bold text-slate-800 dark:text-slate-200">{floor.dimensions}</span></div>
              </div>
              {isOutbid && <p className="-mt-1 mb-3 rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs leading-relaxed text-orange-900">Your bid is 10% above the current floor value. It replaces the displayed campaign only after payment and campaign review.</p>}

              {/* Form & Live Billboard Preview */}
              <div className="grid gap-4 md:grid-cols-[1.08fr_.92fr]">
                <div className="space-y-3">
                  <div>
                    <label htmlFor="campaign-title" className="tech-label mb-1 block">Campaign title</label>
                    <input id="campaign-title" required value={adTitle} onChange={(event) => setAdTitle(event.target.value)} placeholder="e.g. Cyber Genesis" className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.055] px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/15" />
                  </div>
                  <div>
                    <label htmlFor="bid-amount" className="tech-label mb-1 block">Your bid (₹)</label>
                    <input id="bid-amount" type="number" min={floor.price} step="1" required value={bidAmount || ''} onChange={(event) => setBidAmount(Number(event.target.value))} className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.055] px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/15" />
                    <p className="mt-1 text-[10px] text-slate-500">Minimum ₹{floor.price}; enter any higher amount.</p>
                  </div>
                  <div>
                    <label htmlFor="banner-url" className="tech-label mb-1 block">Texture image URL</label>
                    <input id="banner-url" type="url" value={bannerUrl} onChange={(event) => setBannerUrl(event.target.value)} placeholder="https://…/banner.jpg" className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.055] px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/15" />
                  </div>
                  <div>
                    <label htmlFor="target-url" className="tech-label mb-1 block">Link URL</label>
                    <input id="target-url" type="url" value={targetUrl} onChange={(event) => setTargetUrl(event.target.value)} placeholder="https://yourlink.com" className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.055] px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/15" />
                  </div>
                </div>
                <aside className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-slate-900/70 p-3">
                  <span className="tech-label mb-2 block">Live billboard preview</span>
                  <div
                    className="relative flex aspect-[4/3] items-end overflow-hidden rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 via-slate-900 to-indigo-600/30 p-3 shadow-inner"
                    style={bannerUrl ? { backgroundImage: `linear-gradient(180deg, rgba(3,7,18,0.08), rgba(3,7,18,0.82)), url("${bannerUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-300 via-blue-400 to-transparent" />
                    <div className="relative min-w-0">
                       <span className="mb-1 inline-flex rounded-full border border-cyan-300/25 bg-slate-950/65 px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-cyan-200">UPSPACE · LVL {displayNum}</span>
                      <div className="truncate text-sm font-extrabold text-white">{adTitle || 'YOUR CAMPAIGN'}</div>
                      <div className="mt-0.5 truncate text-[10px] text-cyan-200">{targetUrl || 'Destination link preview'}</div>
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] leading-relaxed text-slate-500">{bannerUrl ? 'Artwork is ready for the floor billboard.' : 'Add a texture URL to preview campaign artwork.'}</p>
                </aside>
              </div>

              {/* Action Footer */}
              <footer className="mt-4 flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-3.5">
                <div><span className="tech-label block">{isOutbid ? 'Your outbid' : 'Total due'}</span><span className="text-lg font-black text-cyan-600 dark:text-cyan-400">₹{bidAmount || floor.price}</span></div>
                <div className="flex gap-2">
                  <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-white/[0.07]">Cancel</button>
                  <button type="submit" className="relative overflow-hidden inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-cyan-500 bg-[length:200%_auto] hover:bg-right px-4 py-2 text-xs font-black text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02] active:scale-[0.98]">
                    <Sparkles className="h-4 w-4 text-cyan-200" />
                    <span>{isOutbid ? 'Place outbid' : 'Claim floor'}</span>
                  </button>
                </div>
              </footer>
            </form>
          ) : (
            /* STEP 3: RESERVATION SUCCESS */
            <div className="space-y-4 py-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/35 bg-emerald-500/15 text-emerald-400 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Campaign Minted Successfully!</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Floor {displayNum} is live. Save this claim code and enter it in your profile after you create or sign into an account.
              </p>
              <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 font-mono text-sm font-black tracking-wider text-cyan-800">{claimCode}</div>
              <button onClick={onClose} className="primary-action px-6 py-2.5 text-xs font-black">
                Back to UpSpace 3D
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
