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
  ArrowRight,
  ImageIcon,
  Edit3,
  Layers,
  Coins,
  CreditCard,
  Lock,
  AlertCircle,
  ExternalLink,
  Download,
  Printer,
  FileText,
  Mail,
  Copy,
  Check,
} from 'lucide-react';
import { FloorData, getDisplayFloorNumber } from '@/types/floor';
import { ThemeMode } from '@/types/theme';
import { useAppStore } from '@/store/useAppStore';

export const CAMPAIGN_CATEGORIES = [
  'E-Commerce',
  'SaaS & Tech',
  'AI & Automation',
  'Developer Tools',
  'FinTech',
  'Design & Agency',
  'Media & Gaming',
  'Web3 & Crypto',
  'Health & Fitness',
  'Education',
  'Other / Custom',
];

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
    category?: string;
  }) => void;
}

interface PaymentReceiptData {
  receiptNo: string;
  paymentId: string;
  orderId: string;
  date: string;
  floorNumber: number;
  displayLevel: number;
  brandTitle: string;
  targetUrl: string;
  category: string;
  amount: number;
  claimCode: string;
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

      cleanName = baseDomain
        .split(/[-_.]/)
        .map((part) => {
          if (/^w[0-9]/i.test(part)) {
            return part.slice(0, 2).toUpperCase() + part.slice(2).charAt(0).toUpperCase() + part.slice(3);
          }
          if (part.length <= 3 && !/[aeiou]/i.test(part)) {
            return part.toUpperCase();
          }
          return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join(' ');
    }

    const logoUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`;

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
  const currentUser = useAppStore((state) => state.user);

  const [step, setStep] = useState<'details' | 'success'>('details');
  const [adTitle, setAdTitle] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [buyerEmail, setBuyerEmail] = useState(currentUser?.email || '');
  const [bidAmount, setBidAmount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('E-Commerce');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<PaymentReceiptData | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Initialize or reset modal fields whenever the target floor changes
  useEffect(() => {
    if (!floor) return;
    setStep('details');
    setPaymentError(null);
    setFormError(null);
    setReceiptData(null);

    const isOutbidFlow = floor.status === 'sold';
    const initialUrl = floor.targetUrl || '';
    setTargetUrl(initialUrl);

    let initialTitle = isOutbidFlow && !initialUrl ? '' : (floor.brandTitle || '');
    let initialLogo = isOutbidFlow && !initialUrl ? '' : (floor.adBannerUrl || '');

    if (initialUrl) {
      const meta = extractWebsiteMetadata(initialUrl);
      if (meta) {
        initialTitle = meta.cleanName;
        initialLogo = meta.logoUrl;
      }
    }

    setAdTitle(initialTitle);
    setBannerUrl(initialLogo);
    if (floor.category) {
      setSelectedCategory(floor.category);
    }
    const minBid = floor.price || (floor.status === 'sold' ? Math.ceil(floor.price * 1.1) : 50);
    setBidAmount(minBid);
    setIsProcessing(false);
  }, [floor]);

  // Handle URL change: dynamically auto-generate brand name & high-DPI logo
  const handleUrlChange = (value: string) => {
    setTargetUrl(value);
    setFormError(null);
    const meta = extractWebsiteMetadata(value);
    if (meta) {
      setAdTitle(meta.cleanName);
      setBannerUrl(meta.logoUrl);
    } else {
      const cleanVal = value.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
      if (cleanVal && cleanVal.includes('.')) {
        setBannerUrl(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(cleanVal)}&sz=128`);
      } else if (!value.trim()) {
        setAdTitle('');
        setBannerUrl('');
      }
    }
  };

  if (!floor) return null;

  const nextFloorCount = Math.max(floors.length + 1, floor.floorNumber + 1);
  const displayNum = getDisplayFloorNumber(floor.floorNumber, nextFloorCount);
  const isPenthouse = true;
  const minRequiredBid = floor.price;

  const detectedMeta = extractWebsiteMetadata(targetUrl);

  /**
   * Triggers official Razorpay Checkout directly with NO extra popup
   */
  const handleDirectRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setPaymentError(null);

    const cleanUrl = targetUrl.trim();
    const cleanTitle = adTitle.trim();

    if (!cleanUrl) {
      setFormError('Please enter your Website / Destination URL to continue.');
      return;
    }
    if (!cleanTitle) {
      setFormError('Please enter a Brand Name for this billboard.');
      return;
    }
    if (bidAmount < minRequiredBid) {
      setFormError(`Minimum bid for this level is ₹${minRequiredBid.toLocaleString()}.`);
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Ensure Razorpay SDK is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK could not be loaded. Please check your internet connection.');
      }

      // 2. Create Razorpay order on server
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: bidAmount,
          floorId: floor.id,
          buyerName: cleanTitle,
          brandTitle: cleanTitle,
        }),
      });

      const orderData = await res.json();
      const orderId = orderData?.orderId || `order_${Date.now()}`;
      const activeKey = orderData?.keyId || 'rzp_test_TNDlcqGKurGmEF';

      const generatedCode = `UPS-${Math.random().toString(36).slice(2, 8).toUpperCase()}-L${displayNum}`;

      // 3. Configure Razorpay Checkout Modal
      const options = {
        key: activeKey,
        amount: Math.round(bidAmount * 100),
        currency: 'INR',
        name: 'UpSpace 3D Skyline',
        description: `Level #${displayNum} Permanent Placement · ${cleanTitle}`,
        image: bannerUrl || 'https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/favicon.ico',
        order_id: orderId.startsWith('order_') && orderId.length > 20 ? orderId : undefined,
        prefill: {
          name: cleanTitle,
          email: 'citizen@upspace.live',
          contact: '9999999999',
        },
        notes: {
          floorId: floor.id,
          displayFloor: displayNum,
          brandTitle: cleanTitle,
          targetUrl: cleanUrl,
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
            // 4. Verify payment on backend
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id || orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                floorId: floor.id,
                amount: bidAmount,
                buyerName: cleanTitle,
                brandTitle: cleanTitle,
                targetUrl: cleanUrl,
                buyerEmail: buyerEmail.trim() || undefined,
                claimCode: generatedCode,
                displayLevel: displayNum,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              const paymentReceipt: PaymentReceiptData = {
                receiptNo: `UPS-REC-${Date.now().toString().slice(-8)}`,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id || orderId,
                date: new Date().toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }),
                floorNumber: floor.floorNumber,
                displayLevel: displayNum,
                brandTitle: cleanTitle,
                targetUrl: cleanUrl,
                category: selectedCategory.trim() || 'Custom Campaign',
                amount: bidAmount,
                claimCode: generatedCode,
              };

              setReceiptData(paymentReceipt);

              onConfirm({
                title: cleanTitle,
                bannerUrl: bannerUrl.trim(),
                targetUrl: cleanUrl,
                bidAmount,
                claimCode: generatedCode,
                category: selectedCategory.trim() || 'Custom Campaign',
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
        setPaymentError(response?.error?.description || 'Payment was cancelled or failed in Razorpay.');
        setIsProcessing(false);
      });

      rzp.open();
    } catch (err: any) {
      console.warn('Razorpay open notice:', err);
      setPaymentError(err?.message || 'Could not launch Razorpay gateway. Please try again.');
      setIsProcessing(false);
    }
  };

  /**
   * Generates and downloads an official printable HTML Payment Receipt / Invoice
   */
  const handleDownloadReceipt = () => {
    if (!receiptData) return;

    const receiptHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UpSpace Receipt - Level #${receiptData.displayLevel} (${receiptData.brandTitle})</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 40px 20px;
    }
    .receipt-card {
      max-width: 640px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 36px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.06);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 24px;
    }
    .brand-logo {
      font-size: 26px;
      font-weight: 900;
      color: #ea580c;
      letter-spacing: -0.5px;
    }
    .badge {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .title {
      font-size: 20px;
      font-weight: 900;
      margin: 24px 0 6px;
      color: #0f172a;
    }
    .subtitle {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
      margin-bottom: 24px;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .table td {
      padding: 12px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 13px;
    }
    .table td.label {
      color: #64748b;
      font-weight: 600;
      width: 38%;
    }
    .table td.value {
      color: #0f172a;
      font-weight: 700;
      text-align: right;
    }
    .total-row td {
      border-bottom: none;
      font-size: 18px;
      font-weight: 900;
      color: #ea580c;
      padding-top: 20px;
    }
    .token-box {
      background: #f0fdf4;
      border: 1px dashed #86efac;
      border-radius: 12px;
      padding: 16px;
      margin-top: 24px;
      text-align: center;
    }
    .token-label {
      font-size: 11px;
      font-weight: 800;
      color: #15803d;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .token-val {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 16px;
      font-weight: 900;
      color: #166534;
      letter-spacing: 1.5px;
    }
    .footer {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #f1f5f9;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      font-weight: 600;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .receipt-card { box-shadow: none; border: none; padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="receipt-card">
    <div class="header">
      <div class="brand-logo">UpSpace 3D Skyline</div>
      <div class="badge">PAID &amp; VERIFIED</div>
    </div>
    
    <div class="title">Billboard Placement Receipt</div>
    <div class="subtitle">Official Transaction Invoice for Permanent Virtual Real Estate</div>

    <table class="table">
      <tr>
        <td class="label">Receipt Number:</td>
        <td class="value">${receiptData.receiptNo}</td>
      </tr>
      <tr>
        <td class="label">Payment ID:</td>
        <td class="value">${receiptData.paymentId}</td>
      </tr>
      <tr>
        <td class="label">Order ID:</td>
        <td class="value">${receiptData.orderId}</td>
      </tr>
      <tr>
        <td class="label">Date &amp; Time:</td>
        <td class="value">${receiptData.date}</td>
      </tr>
      <tr>
        <td class="label">Floor Level:</td>
        <td class="value">Level #${receiptData.displayLevel}</td>
      </tr>
      <tr>
        <td class="label">Ownership Type:</td>
        <td class="value">Permanent Lifetime Ownership</td>
      </tr>
      <tr>
        <td class="label">Brand / Title:</td>
        <td class="value">${receiptData.brandTitle}</td>
      </tr>
      <tr>
        <td class="label">Destination URL:</td>
        <td class="value">${receiptData.targetUrl}</td>
      </tr>
      <tr>
        <td class="label">Category:</td>
        <td class="value">${receiptData.category}</td>
      </tr>
      <tr class="total-row">
        <td class="label">Amount Paid:</td>
        <td class="value">₹${receiptData.amount.toLocaleString('en-IN')} INR</td>
      </tr>
    </table>

    <div class="token-box">
      <div class="token-label">Campaign Authentication Token</div>
      <div class="token-val">${receiptData.claimCode}</div>
    </div>

    <div class="footer">
      UpSpace 3D Virtual Real Estate &amp; Billboard Infrastructure · 256-Bit SSL Verified
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UpSpace-Receipt-Level-${receiptData.displayLevel}-${receiptData.brandTitle.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyToken = () => {
    if (!receiptData) return;
    navigator.clipboard?.writeText(receiptData.claimCode);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <section
        className={`w-full max-w-2xl rounded-[1.8rem] sm:rounded-3xl p-3 sm:p-5 border shadow-2xl overflow-visible flex flex-col ${
          isDay
            ? 'bg-white border-slate-300 text-slate-950 shadow-slate-900/20'
            : 'bg-slate-950 border-white/15 text-white shadow-black/80'
        }`}
      >
        {/* MODAL HEADER */}
        <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-200 dark:border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-orange-700 dark:text-orange-400">
                {isPenthouse ? <Crown className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
                {step === 'success' ? 'Payment Completed' : isPenthouse ? 'Penthouse Billboard' : 'Floor Reservation'}
              </span>
            </div>
            <h2 className="mt-0.5 text-lg sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              {step === 'success'
                ? `Official Placement Receipt`
                : floors.length === 0
                ? `Claim Level #1 (Ground Concourse)`
                : `Claim Level #${displayNum} (Top Penthouse)`}
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
        <div className="flex-1 overflow-visible py-2 space-y-2">
          {/* STEP 1: CAMPAIGN DETAILS & DIRECT RAZORPAY CHECKOUT */}
          {step === 'details' && (
            <form onSubmit={handleDirectRazorpayPayment} className="space-y-2.5">
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
                      +{floor.elevationMeters.toFixed(1)}m · Permanent Placement
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
                  placeholder="e.g. w3tech.co.in, stripe.com, shopifythemedownloader.in"
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
                  placeholder="e.g. W3Tech / Shopify Theme Downloader"
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
                    type="text"
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

              {/* CAMPAIGN CATEGORY */}
              <div>
                <label className="text-xs font-black text-slate-900 dark:text-slate-200 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-orange-600 dark:text-cyan-400" />
                    Category *
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Select or Custom
                  </span>
                </label>
                <div className="space-y-1.5">
                  <select
                    value={CAMPAIGN_CATEGORIES.includes(selectedCategory) ? selectedCategory : 'Other / Custom'}
                    onChange={(e) => {
                      if (e.target.value !== 'Other / Custom') {
                        setSelectedCategory(e.target.value);
                      } else {
                        setSelectedCategory('');
                      }
                    }}
                    className={`w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold border outline-none transition cursor-pointer ${
                      isDay
                        ? 'bg-slate-50 border-slate-300 focus:border-slate-900 text-slate-950 shadow-sm'
                        : 'bg-white/5 border-white/10 focus:border-cyan-400 text-white'
                    }`}
                  >
                    {CAMPAIGN_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className={isDay ? 'text-slate-900 bg-white' : 'text-white bg-slate-900'}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {(!CAMPAIGN_CATEGORIES.includes(selectedCategory) || selectedCategory === 'Other / Custom' || selectedCategory === '') && (
                    <input
                      type="text"
                      required
                      value={selectedCategory === 'Other / Custom' ? '' : selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      placeholder="e.g. E-Commerce, Custom Campaign, AI Tools"
                      className={`w-full px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold border outline-none transition ${
                        isDay
                          ? 'bg-slate-50 border-slate-300 focus:border-slate-900 text-slate-950 placeholder:text-slate-500 shadow-sm'
                          : 'bg-white/5 border-white/10 focus:border-cyan-400 text-white placeholder:text-slate-400'
                      }`}
                    />
                  )}
                </div>
              </div>

              {/* CONTACT & RECEIPT EMAIL */}
              <div>
                <label className="text-xs font-black text-slate-900 dark:text-slate-200 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-orange-600 dark:text-cyan-400" />
                    Receipt &amp; Outbid Alerts Email
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                    Sends invoice &amp; telemetry
                  </span>
                </label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="e.g. founder@brand.com (optional)"
                  className={`w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold border outline-none transition ${
                    isDay
                      ? 'bg-slate-50 border-slate-300 focus:border-slate-900 text-slate-950 placeholder:text-slate-500 shadow-sm'
                      : 'bg-white/5 border-white/10 focus:border-cyan-400 text-white placeholder:text-slate-400'
                  }`}
                />
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

              {/* ERROR NOTIFICATION */}
              {(formError || paymentError) && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError || paymentError}</span>
                </div>
              )}

              {/* DIRECT RAZORPAY CHECKOUT ACTION BUTTON */}
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
                  disabled={isProcessing}
                  className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 touch-manipulation"
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
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: OFFICIAL PAYMENT RECEIPT & DOWNLOAD */}
          {step === 'success' && receiptData && (
            <div className="space-y-4 animate-in fade-in">
              {/* SUCCESS ICON HEADER */}
              <div className="text-center space-y-1">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 shadow-lg shadow-emerald-500/15">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
                  Payment Successful!
                </h3>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Level #{receiptData.displayLevel} is now permanently active on UpSpace.
                </p>
              </div>

              {/* OFFICIAL RECEIPT CONTAINER */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDay ? 'bg-slate-50 border-slate-300' : 'bg-white/[0.03] border-white/10'
                }`}
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                    <FileText className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                    <span>{receiptData.receiptNo}</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                    PAID &amp; VERIFIED
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 font-bold">Floor Level:</span>
                    <span className="font-black text-slate-950 dark:text-white">
                      Level #{receiptData.displayLevel} (Permanent Placement)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 font-bold">Brand / Sponsor:</span>
                    <span className="font-black text-slate-950 dark:text-white">{receiptData.brandTitle}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 font-bold">Destination URL:</span>
                    <a
                      href={receiptData.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:underline max-w-[200px] truncate"
                    >
                      {receiptData.targetUrl}
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 font-bold">Payment ID:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-300 text-[11px]">
                      {receiptData.paymentId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 font-bold">Date &amp; Time:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-300 text-[11px]">
                      {receiptData.date}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10">
                    <span className="text-sm font-black text-slate-950 dark:text-white">Amount Paid:</span>
                    <span className="text-base font-black font-mono text-orange-600 dark:text-orange-400">
                      ₹{receiptData.amount.toLocaleString('en-IN')} INR
                    </span>
                  </div>
                </div>

                {/* TOKEN BOX WITH COPY BUTTON */}
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[9px] font-black uppercase tracking-wider text-cyan-800 dark:text-cyan-300">
                      Claim Authentication Token
                    </div>
                    <div className="font-mono font-black text-xs text-cyan-950 dark:text-cyan-200 truncate">
                      {receiptData.claimCode}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyToken}
                    className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-900 dark:text-cyan-200 hover:bg-cyan-500/30 transition shrink-0"
                    title="Copy Token"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* ACTION BUTTONS: DOWNLOAD RECEIPT & RETURN TO SKYLINE */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2 touch-manipulation"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Payment Receipt (.html / print)</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 sm:py-3 rounded-xl bg-slate-950 hover:bg-slate-800 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white dark:text-slate-950 font-black text-xs sm:text-sm shadow-md transition active:scale-[0.98] touch-manipulation"
                >
                  Return to 3D Skyline
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER NOTICE */}
        {step !== 'success' && (
          <div className="mt-1 pt-2.5 border-t border-slate-200 dark:border-white/10 shrink-0">
            <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
              <span>Razorpay Secured · 256-Bit SSL Encrypted · Instant Lifetime Activation</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
