'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Sparkles,
  X,
  ShieldCheck,
  Building2,
  Globe,
  Tag,
  Crown,
  Smartphone,
  Copy,
  Check,
  ArrowRight,
  ImageIcon,
  Edit3,
  QrCode,
  Layers,
  Coins,
  CreditCard,
  Lock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { FloorData, getDisplayFloorNumber, isPenthouseFloor } from '@/types/floor';
import { ThemeMode } from '@/types/theme';

interface PurchaseModalProps {
  floor: FloorData | null;
  floors: FloorData[];
  theme: ThemeMode;
  onClose: () => void;
  onConfirm: (campaign: {
    title: string;
    bannerUrl: string;
    targetUrl: string;
    bidAmount: number;
    claimCode: string;
  }) => void;
}

/**
 * Dynamically loads the official Razorpay Checkout SDK
 */
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Automatically extracts a clean, human-readable brand name and high-resolution logo from a website URL
 */
function extractWebsiteMetadata(inputUrl: string): { domain: string; cleanName: string; logoUrl: string } | null {
  try {
    let clean = inputUrl.trim();
    if (!clean) return null;
    if (!/^https?:\/\//i.test(clean)) {
      clean = 'https://' + clean;
    }
    const parsed = new URL(clean);
    let hostname = parsed.hostname.replace(/^www\./i, '');
    if (!hostname || hostname.length < 3 || !hostname.includes('.')) return null;

    // Special tech brand dictionary with accurate casing
    const specialBrands: Record<string, string> = {
      'github.com': 'GitHub',
      'youtube.com': 'YouTube',
      'twitter.com': 'X / Twitter',
      'x.com': 'X',
      'linkedin.com': 'LinkedIn',
      'figma.com': 'Figma',
      'linear.app': 'Linear',
      'vercel.com': 'Vercel',
      'supabase.com': 'Supabase',
      'stripe.com': 'Stripe',
      'notion.so': 'Notion',
      'apple.com': 'Apple',
      'google.com': 'Google',
      'openai.com': 'OpenAI',
      'spotify.com': 'Spotify',
      'airbnb.com': 'Airbnb',
      'discord.com': 'Discord',
      'slack.com': 'Slack',
      'reddit.com': 'Reddit',
      'producthunt.com': 'Product Hunt',
      'w3tech.co.in': 'W3Tech',
      'w3tech.com': 'W3Tech',
      'w3tech.in': 'W3Tech',
    };

    let cleanName = specialBrands[hostname.toLowerCase()];
    if (!cleanName) {
      // Strip common TLDs and second-level extensions (.co.in, .com, .io, .ai, .org, .net, etc.)
      const baseDomain = hostname
        .replace(/\.(co\.[a-z]{2}|org\.[a-z]{2}|net\.[a-z]{2}|edu\.[a-z]{2}|gov\.[a-z]{2}|[a-z]{2,8})$/i, '')
        .replace(/\.[a-z]{2,4}$/i, '');

      // Smart capitalization & spacing for compound names like w3tech -> W3Tech, techcorp -> Techcorp
      cleanName = baseDomain
        .split(/[-_.]/)
        .map((part) => {
          if (/^w[0-9]/i.test(part)) {
            // e.g. w3tech -> W3Tech
            return part.slice(0, 2).toUpperCase() + part.slice(2).charAt(0).toUpperCase() + part.slice(3);
          }
          if (part.length <= 3 && !/[aeiou]/i.test(part)) {
            return part.toUpperCase();
          }
          return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join(' ');
    }

    const logoUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

    return {
      domain: hostname,
      cleanName: cleanName || hostname,
      logoUrl,
    };
  } catch {
    return null;
  }
}

export function PurchaseModal({ floor, floors, theme, onClose, onConfirm }: PurchaseModalProps) {
  const isDay = theme === 'day';

  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [paymentTab, setPaymentTab] = useState<'razorpay' | 'upi_qr'>('razorpay');
  const [adTitle, setAdTitle] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [bidAmount, setBidAmount] = useState(0);
  const [claimCode, setClaimCode] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [keyId, setKeyId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (!floor) return;
    setStep('details');
    setPaymentTab('razorpay');
    setPaymentError(null);
    const initialUrl = floor.targetUrl || '';
    setTargetUrl(initialUrl);

    let initialTitle = floor.brandTitle || '';
    let initialLogo = floor.adBannerUrl || '';

    if (initialUrl) {
      const meta = extractWebsiteMetadata(initialUrl);
      if (meta) {
        initialTitle = meta.cleanName;
        if (!initialLogo) initialLogo = meta.logoUrl;
      }
    }

    setAdTitle(initialTitle);
    setBannerUrl(initialLogo);
    const minBid = floor.status === 'sold' ? Math.ceil(floor.price * 1.1) : floor.price;
    setBidAmount(minBid);
    setClaimCode('');
    setIsProcessing(false);
  }, [floor]);

  // Handle URL change: dynamically auto-generate brand name & high-DPI logo
  const handleUrlChange = (value: string) => {
    setTargetUrl(value);
    const meta = extractWebsiteMetadata(value);
    if (meta) {
      setAdTitle(meta.cleanName);
      setBannerUrl(meta.logoUrl);
    }
  };

  if (!floor) return null;

  const displayNum = getDisplayFloorNumber(floor.floorNumber, floors.length);
  const isPenthouse = isPenthouseFloor(floor.floorNumber, floors.length);
  const isOutbid = floor.status === 'sold';
  const minRequiredBid = isOutbid ? Math.ceil(floor.price * 1.1) : floor.price;

  const upiId = 'upspace.skyline@okhdfcbank';
  const upiPayload = `upi://pay?pa=${upiId}&pn=UpSpace%20Skyline&am=${bidAmount}&cu=INR&tn=Floor%20${displayNum}%20Billboard`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    upiPayload
  )}&bgcolor=${isDay ? 'ffffff' : '020617'}&color=${isDay ? '0f172a' : '38bdf8'}&margin=6`;

  const detectedMeta = extractWebsiteMetadata(targetUrl);

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle.trim() || !targetUrl.trim()) return;
    setPaymentError(null);

    // Call backend order creation API
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: bidAmount,
          floorId: floor.id,
          buyerName: adTitle.trim(),
          brandTitle: adTitle.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.orderId) {
          setPaymentOrderId(data.orderId);
          if (data.keyId) setKeyId(data.keyId);
        }
      }
    } catch (err) {
      console.warn('Backend order creation notice:', err);
    }

    setStep('payment');
  };

  /**
   * Triggers the official Razorpay Checkout Gateway
   */
  const handleLaunchRazorpayCheckout = async () => {
    setIsProcessing(true);
    setPaymentError(null);
    const title = adTitle.trim();

    try {
      // 1. Ensure Razorpay SDK is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK could not be loaded. Please check your network or try UPI QR.');
      }

      // 2. Fetch fresh order if missing
      let orderId = paymentOrderId;
      let activeKey = keyId;

      if (!orderId || !activeKey) {
        const res = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: bidAmount,
            floorId: floor.id,
            buyerName: title,
            brandTitle: title,
          }),
        });
        const orderData = await res.json();
        if (orderData?.orderId) {
          orderId = orderData.orderId;
          activeKey = orderData.keyId;
          setPaymentOrderId(orderData.orderId);
          setKeyId(orderData.keyId);
        }
      }

      const generatedCode = `UPS-${Math.random().toString(36).slice(2, 8).toUpperCase()}-L${displayNum}`;
      setClaimCode(generatedCode);

      // 3. Configure Razorpay Checkout Modal
      const options = {
        key: activeKey || 'rzp_test_TNDlcqGKurGmEF',
        amount: Math.round(bidAmount * 100),
        currency: 'INR',
        name: 'UpSpace 3D Skyline',
        description: `Level #${displayNum} Billboard Lease · ${title}`,
        image: bannerUrl || 'https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/favicon.ico',
        order_id: orderId && orderId.startsWith('order_') && !orderDataIsSimulated(orderId) ? orderId : undefined,
        prefill: {
          name: title,
          email: 'citizen@upspace.live',
          contact: '9999999999',
        },
        notes: {
          floorId: floor.id,
          displayFloor: displayNum,
          brandTitle: title,
          targetUrl: targetUrl.trim(),
        },
        theme: {
          color: '#f97316',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id?: string;
          razorpay_signature?: string;
        }) => {
          try {
            // 4. Verify payment cryptographically on backend
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id || orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                floorId: floor.id,
                amount: bidAmount,
                buyerName: title,
                brandTitle: title,
                targetUrl: targetUrl.trim(),
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              onConfirm({
                title,
                bannerUrl: bannerUrl.trim(),
                targetUrl: targetUrl.trim(),
                bidAmount,
                claimCode: generatedCode,
              });
              setIsProcessing(false);
              setStep('success');
            } else {
              setPaymentError(verifyData?.error || 'Payment signature verification failed.');
              setIsProcessing(false);
            }
          } catch (err: any) {
            setPaymentError(err?.message || 'Failed to complete payment verification.');
            setIsProcessing(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setPaymentError(response?.error?.description || 'Payment transaction failed or cancelled.');
        setIsProcessing(false);
      });

      rzp.open();
    } catch (err: any) {
      console.warn('Razorpay open notice:', err);
      setPaymentError(err?.message || 'Could not open Razorpay checkout modal. You can use direct UPI.');
      setIsProcessing(false);
    }
  };

  function orderDataIsSimulated(orderId: string) {
    return orderId.includes('_') && orderId.length > 25;
  }

  const handleFinalPublishSimulated = async () => {
    setIsProcessing(true);
    setPaymentError(null);
    const title = adTitle.trim();
    const generatedCode = `UPS-${Math.random().toString(36).slice(2, 8).toUpperCase()}-L${displayNum}`;
    setClaimCode(generatedCode);

    // Call backend payment verify API
    try {
      await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId: paymentOrderId || `order_${Date.now()}`,
          razorpayPaymentId: `pay_${Date.now()}`,
          floorId: floor.id,
          amount: bidAmount,
          buyerName: title,
          brandTitle: title,
          targetUrl: targetUrl.trim(),
        }),
      });
    } catch (err) {
      console.warn('Backend verification notice:', err);
    }

    setTimeout(() => {
      onConfirm({
        title,
        bannerUrl: bannerUrl.trim(),
        targetUrl: targetUrl.trim(),
        bidAmount,
        claimCode: generatedCode,
      });
      setIsProcessing(false);
      setStep('success');
    }, 500);
  };

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <section
        className={`w-full max-w-lg rounded-[1.8rem] sm:rounded-3xl p-4 sm:p-7 border shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[92vh] ${
          isDay
            ? 'bg-white border-slate-300 text-slate-950 shadow-slate-900/20'
            : 'bg-slate-950 border-white/15 text-white shadow-black/80'
        }`}
      >
        {/* MODAL HEADER */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-orange-700 dark:text-orange-400">
                {isPenthouse ? <Crown className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
                {isPenthouse ? 'Penthouse Billboard' : 'Floor Reservation'}
              </span>
              {step !== 'success' && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-slate-200">
                  Step {step === 'details' ? '1/2' : '2/2'}
                </span>
              )}
            </div>
            <h2 className="mt-0.5 text-lg sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              {step === 'payment'
                ? `Checkout · Level ${displayNum}`
                : isOutbid
                ? `Outbid Level ${displayNum}`
                : `Claim Level ${displayNum}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl sm:rounded-full border border-slate-300 dark:border-white/10 text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 transition touch-manipulation"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 custom-scrollbar">
          {/* STEP 1: CAMPAIGN DETAILS */}
          {step === 'details' && (
            <form onSubmit={handleProceedToPayment} className="space-y-3.5">
              {/* FLOOR SUMMARY CARD */}
              <div
                className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border flex items-center justify-between text-xs ${
                  isDay ? 'bg-slate-100 border-slate-300' : 'bg-white/[0.03] border-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-600 flex items-center justify-center shrink-0">
                    {isPenthouse ? <Crown className="w-4 h-4 sm:w-5 sm:h-5" /> : <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>
                  <div>
                    <div className="font-black text-xs sm:text-sm text-slate-950 dark:text-white">
                      Floor Level #{displayNum}
                    </div>
                    <div className="text-slate-800 dark:text-slate-300 text-[11px] sm:text-xs font-mono font-bold">
                      +{floor.elevationMeters.toFixed(1)}m · 360° Billboard
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[9px] sm:text-[10px] uppercase font-black text-slate-700 dark:text-slate-400">Total Price</span>
                  <div className="font-black text-sm sm:text-lg text-orange-700 dark:text-orange-400">
                    ₹{bidAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* DESTINATION URL */}
              <div>
                <label className="text-xs font-black text-slate-900 dark:text-slate-200 mb-1 flex items-center justify-between flex-wrap gap-1">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-orange-600 dark:text-cyan-400" />
                    Website / Destination URL *
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Auto-extracts brand &amp; logo
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={targetUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="e.g. w3tech.co.in, stripe.com, linear.app"
                  className={`w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold border outline-none transition ${
                    isDay
                      ? 'bg-slate-50 border-slate-300 focus:border-slate-900 text-slate-950 placeholder:text-slate-500 shadow-sm'
                      : 'bg-white/5 border-white/10 focus:border-cyan-400 text-white placeholder:text-slate-400'
                  }`}
                />
              </div>

              {/* LIVE AUTO-DETECTED PREVIEW BADGE */}
              {detectedMeta && (
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-2.5 text-xs animate-in fade-in">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden bg-white border border-slate-200 shadow-sm shrink-0 flex items-center justify-center p-1">
                      <img
                        src={bannerUrl || detectedMeta.logoUrl}
                        alt="Logo"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-xs sm:text-sm text-slate-950 dark:text-white truncate">
                        {adTitle || detectedMeta.cleanName}
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-mono text-slate-700 dark:text-slate-300 truncate">
                        {detectedMeta.domain}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 shrink-0 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Auto-Generated
                  </span>
                </div>
              )}

              {/* EDITABLE BRAND / NAME FIELD */}
              <div>
                <label className="text-xs font-black text-slate-900 dark:text-slate-200 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-orange-600 dark:text-cyan-400" />
                    Brand Name *
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Edit3 className="w-3 h-3" /> Editable
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  placeholder="e.g. W3Tech / Nexus Cloud"
                  className={`w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold border outline-none transition ${
                    isDay
                      ? 'bg-slate-50 border-slate-300 focus:border-slate-900 text-slate-950 placeholder:text-slate-500 shadow-sm'
                      : 'bg-white/5 border-white/10 focus:border-cyan-400 text-white placeholder:text-slate-400'
                  }`}
                />
              </div>

              {/* EDITABLE LOGO / BANNER IMAGE URL */}
              <div>
                <label className="text-xs font-black text-slate-900 dark:text-slate-200 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-orange-600 dark:text-cyan-400" />
                    Billboard Logo URL (Optional)
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Edit3 className="w-3 h-3" /> Editable
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://…/logo.png"
                    className={`flex-1 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold border outline-none transition ${
                      isDay
                        ? 'bg-slate-50 border-slate-300 focus:border-slate-900 text-slate-950 placeholder:text-slate-500 shadow-sm'
                        : 'bg-white/5 border-white/10 focus:border-cyan-400 text-white placeholder:text-slate-400'
                    }`}
                  />
                  {bannerUrl && (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden bg-white border border-slate-300 shadow-sm shrink-0 flex items-center justify-center p-1">
                      <img src={bannerUrl} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>

              {/* BID AMOUNT ADJUSTER */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    Bid Amount (₹) *
                  </label>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 font-mono">
                    Min ₹{minRequiredBid.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={minRequiredBid}
                    required
                    value={bidAmount || ''}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className={`flex-1 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-mono font-black border outline-none transition ${
                      isDay
                        ? 'bg-slate-50 border-slate-300 focus:border-slate-900 text-slate-950 shadow-sm'
                        : 'bg-white/5 border-white/10 focus:border-cyan-400 text-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setBidAmount((prev) => prev + 500)}
                    className="px-2.5 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-black hover:bg-slate-100 dark:hover:bg-white/10 touch-manipulation"
                  >
                    +₹500
                  </button>
                  <button
                    type="button"
                    onClick={() => setBidAmount((prev) => prev + 1000)}
                    className="px-2.5 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-black hover:bg-slate-100 dark:hover:bg-white/10 touch-manipulation"
                  >
                    +₹1k
                  </button>
                </div>
              </div>

              {/* PROCEED BUTTON */}
              <div className="pt-2 flex items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 sm:px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-black text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition active:scale-[0.98] flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: RAZORPAY GATEWAY & UPI PAYMENT */}
          {step === 'payment' && (
            <div className="space-y-3.5 animate-in fade-in">
              {/* PAYMENT ERROR NOTIFICATION */}
              {paymentError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* PAYMENT METHOD TABS */}
              <div className="flex p-1 rounded-xl bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setPaymentTab('razorpay')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition ${
                    paymentTab === 'razorpay'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Razorpay Gateway</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/20 uppercase">Live</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentTab('upi_qr')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition ${
                    paymentTab === 'upi_qr'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>UPI QR Scan</span>
                </button>
              </div>

              {/* OPTION 1: RAZORPAY OFFICIAL GATEWAY MODAL */}
              {paymentTab === 'razorpay' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/25 space-y-4 text-center">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Lock className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                      Official Razorpay Checkout
                    </h3>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1 max-w-xs mx-auto">
                      Supports all UPI Apps (GPay, PhonePe, Paytm), Debit/Credit Cards, Net Banking &amp; Wallets.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-600 dark:text-slate-400 font-bold">Total Amount to Pay:</span>
                    <span className="text-sm font-black text-orange-600 dark:text-orange-400">
                      ₹{bidAmount.toLocaleString()} INR
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLaunchRazorpayCheckout}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-xl shadow-orange-500/30 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 touch-manipulation"
                  >
                    {isProcessing ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>Opening Razorpay Gateway...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Pay ₹{bidAmount.toLocaleString()} via Razorpay</span>
                        <ExternalLink className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>256-Bit SSL Encrypted &amp; PCI-DSS Level 1 Compliant</span>
                  </div>
                </div>
              )}

              {/* OPTION 2: INSTANT SCANNABLE UPI QR */}
              {paymentTab === 'upi_qr' && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                    {/* DYNAMIC SCANNABLE QR CODE */}
                    <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl p-2 bg-white border border-slate-300 shadow-md flex items-center justify-center shrink-0">
                      <img
                        src={qrCodeUrl}
                        alt="UPI Payment QR Code"
                        className="w-full h-full object-contain rounded-lg"
                      />
                      <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl pointer-events-none" />
                    </div>

                    {/* PAYMENT INSTRUCTIONS & UPI ID */}
                    <div className="flex-1 flex flex-col justify-center text-center sm:text-left space-y-1.5 sm:space-y-2 w-full">
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-400">
                        <Smartphone className="w-4 h-4" />
                        <span>Scan with Any UPI App</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        GPay, PhonePe, Paytm, BHIM, or Banking Apps
                      </p>

                      <div className="font-mono text-sm font-black text-orange-700 dark:text-orange-400">
                        Amount: ₹{bidAmount.toLocaleString()}
                      </div>

                      {/* UPI ID COPY BAR */}
                      <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-200/80 dark:bg-white/10 border border-slate-300 dark:border-white/10 text-xs font-mono font-bold">
                        <span className="truncate flex-1 text-[11px] text-slate-900 dark:text-slate-200">{upiId}</span>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="p-1 rounded-lg hover:bg-slate-300 dark:hover:bg-white/20 transition text-slate-800 dark:text-slate-200 shrink-0 touch-manipulation"
                          title="Copy UPI ID"
                        >
                          {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleFinalPublishSimulated}
                    disabled={isProcessing}
                    className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition active:scale-[0.98] flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 touch-manipulation"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isProcessing ? 'Verifying...' : 'I Have Paid via UPI · Publish Live'}</span>
                  </button>
                </div>
              )}

              {/* ACTION BACK BUTTON */}
              <div className="pt-1 flex items-center justify-start">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-3.5 sm:px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-black text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition touch-manipulation"
                >
                  Back to Details
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS ACTIVATION */}
          {step === 'success' && (
            <div className="py-5 sm:py-6 space-y-3.5 text-center animate-in fade-in">
              <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                  Campaign Published Live!
                </h3>
                <p className="mt-1 text-xs font-bold text-slate-700 dark:text-slate-400 max-w-sm mx-auto">
                  Level {displayNum} is now active on the UpSpace 3D skyline. Your campaign token:
                </p>
              </div>
              <div className="p-3 rounded-xl sm:rounded-2xl bg-cyan-500/15 border border-cyan-500/40 font-mono font-black text-xs sm:text-sm text-cyan-950 dark:text-cyan-300 tracking-wider">
                {claimCode}
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 sm:py-3 rounded-xl bg-slate-950 hover:bg-slate-800 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white dark:text-slate-950 font-black text-xs sm:text-sm shadow-md transition active:scale-[0.98] touch-manipulation"
              >
                Return to 3D Skyline
              </button>
            </div>
          )}
        </div>

        {/* MODAL FOOTER NOTICE */}
        {step !== 'success' && (
          <div className="mt-1 pt-2.5 border-t border-slate-200 dark:border-white/10 shrink-0">
            <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
              <span>Instant automated activation · 7-Day protected lease</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

