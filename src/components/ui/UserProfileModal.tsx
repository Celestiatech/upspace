'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Mail,
  Building2,
  Sparkles,
  LogOut,
  ExternalLink,
  Compass,
  Edit3,
  Check,
  Copy,
  Upload,
  Camera,
  AtSign,
  IdCard,
  ShieldCheck,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { FloorData, getDisplayFloorNumber } from '@/types/floor';
import { ThemeMode } from '@/types/theme';
import { useAppStore } from '@/store/useAppStore';
import { createClient } from '@/utils/supabase/browser';

interface UserProfileModalProps {
  theme: ThemeMode;
  floors: FloorData[];
  onClose: () => void;
  onSelectFloor: (floor: FloorData) => void;
  onOpenBuild: () => void;
}

// Curated 3D & High-Tech avatar presets
const PRESET_AVATARS = [
  { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80', label: 'Cyber Red' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80', label: 'Tech Pro' },
  { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80', label: 'Nexus' },
  { url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&auto=format&fit=crop&q=80', label: 'Matrix' },
  { url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberNeon', label: 'AI Bot' },
  { url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix', label: 'Explorer' },
];

export function UserProfileModal({
  theme,
  floors,
  onClose,
  onSelectFloor,
  onOpenBuild,
}: UserProfileModalProps) {
  const user = useAppStore((state) => state.user);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const logout = useAppStore((state) => state.logout);
  const addFloor = useAppStore((state) => state.addFloor);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editAvatarUrl, setEditAvatarUrl] = useState(user?.avatarUrl || '');
  const [copiedId, setCopiedId] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [claimCode, setClaimCode] = useState('');
  const [claimMessage, setClaimMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  // Filter user's owned floors
  const userFloors = floors.filter(
    (f) =>
      f.status === 'sold' &&
      (f.ownerName?.toLowerCase() === user.name?.toLowerCase() ||
        f.ownerName?.toLowerCase() === user.email?.toLowerCase() ||
        f.ownerName?.toLowerCase() === user.username?.toLowerCase() ||
        f.ownerName === 'UpSpace Member' ||
        f.brandTitle?.toLowerCase().includes('genesis') ||
        user.provider === 'google')
  );

  const totalImpressions = userFloors.length * 45000;

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setEditAvatarUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername =
      editUsername.trim().replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_]/g, '') || user.username;
    const cleanName = editName.trim() || user.name;

    updateProfile({
      name: cleanName,
      username: cleanUsername,
      avatarUrl: editAvatarUrl || undefined,
    });

    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    logout();
    onClose();
  };

  const handleClaimPurchase = () => {
    const code = claimCode.trim().toUpperCase();
    const floor = floors.find((item) => item.claimCode === code && item.ownerName === 'Unclaimed purchase');
    if (!floor) {
      setClaimMessage('That code is invalid or has already been claimed.');
      return;
    }
    addFloor({ ...floor, ownerName: user.name, claimCode: undefined });
    setClaimCode('');
    setClaimMessage(`Floor ${getDisplayFloorNumber(floor.floorNumber, floors.length)} is now linked to your profile.`);
  };

  const isDay = theme === 'day';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <section
        className={`w-full max-w-3xl rounded-[1.8rem] sm:rounded-[2.2rem] p-4 sm:p-7 border shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[92vh] ${
          isDay
            ? 'bg-white/95 border-slate-200/90 text-slate-950 shadow-slate-900/20'
            : 'bg-slate-950/95 border-white/15 text-white shadow-black/80'
        }`}
      >
        {/* MODAL HEADER */}
        <header className="flex items-start justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-200 dark:border-white/10 shrink-0">
          <div>
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Citizen Registry &amp; Assets
            </p>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              Citizen Profile
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition hover:scale-105 active:scale-95 touch-manipulation"
            aria-label="Close profile"
          >
            <X size={18} />
          </button>
        </header>

        {/* SAVE SUCCESS TOAST */}
        {saveSuccess && (
          <div className="mt-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 sm:space-y-4 custom-scrollbar">
          {/* USER IDENTITY HERO CARD */}
          {!isEditing ? (
            <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border relative overflow-hidden transition-all ${
              isDay
                ? 'bg-gradient-to-br from-slate-50 via-cyan-50/30 to-amber-50/40 border-slate-200/80 shadow-sm'
                : 'bg-gradient-to-br from-white/[0.04] via-cyan-950/20 to-indigo-950/30 border-white/10 shadow-lg'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 relative z-10">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full sm:w-auto">
                  {/* BEAUTIFUL AVATAR WITH GLOWING RING */}
                  <div
                    onClick={() => {
                      setEditName(user.name);
                      setEditUsername(user.username);
                      setEditAvatarUrl(user.avatarUrl || '');
                      setIsEditing(true);
                    }}
                    className="relative group/avatar cursor-pointer p-0.5 sm:p-1 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-cyan-500 via-amber-500 to-orange-500 shadow-lg shadow-orange-500/20 transition-transform duration-300 hover:scale-105 shrink-0 touch-manipulation"
                    title="Click to edit profile photo"
                  >
                    <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-[1.1rem] sm:rounded-[1.4rem] overflow-hidden bg-slate-900 flex items-center justify-center relative">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-full h-full object-cover rounded-[1.1rem] sm:rounded-[1.4rem]"
                        />
                      ) : (
                        <User className="w-7 h-7 sm:w-8 sm:h-8 text-white/80" />
                      )}
                      {/* Hover Camera Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity rounded-[1.1rem] sm:rounded-[1.4rem]">
                        <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    </div>

                    {/* Active Live Pulse Badge */}
                    <span className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-emerald-500 border-2 border-white dark:border-slate-950" />
                    </span>
                  </div>

                  {/* IDENTITY INFO */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <h3 className="text-base sm:text-xl font-black text-slate-950 dark:text-white leading-tight truncate">
                        {user.name}
                      </h3>
                      <span className="text-[11px] sm:text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg shrink-0">
                        @{user.username}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1 text-xs text-slate-600 dark:text-slate-400 truncate">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>

                    {/* Citizen ID Badge */}
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
                      <button
                        onClick={handleCopyId}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-mono font-black bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-white/20 transition touch-manipulation"
                        title="Click to copy Citizen ID"
                      >
                        <IdCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-500" />
                        <span className="truncate max-w-[150px] sm:max-w-none">ID: {user.id}</span>
                        {copiedId ? (
                          <Check className="w-3 h-3 text-emerald-500 ml-0.5 shrink-0" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400 ml-0.5 shrink-0" />
                        )}
                      </button>
                      <span className="text-[9px] sm:text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">
                        {user.provider === 'google' ? 'Google Linked' : 'Active Citizen'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-white/10">
                  <button
                    onClick={() => {
                      setEditName(user.name);
                      setEditUsername(user.username);
                      setEditAvatarUrl(user.avatarUrl || '');
                      setIsEditing(true);
                    }}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl sm:rounded-2xl text-xs font-black text-cyan-700 dark:text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 transition shadow-sm hover:scale-105 active:scale-95 touch-manipulation"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl sm:rounded-2xl text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition shadow-sm hover:scale-105 active:scale-95 touch-manipulation"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* PROFILE EDIT MODE */
            <form
              onSubmit={handleSaveProfile}
              className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border shadow-lg space-y-3 sm:space-y-4 animate-in fade-in ${
                isDay ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                <h3 className="text-xs sm:text-sm font-black text-slate-950 dark:text-white flex items-center gap-1.5 sm:gap-2">
                  <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500" />
                  <span>Customize Avatar &amp; Handle</span>
                </h3>
                <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 truncate max-w-[120px] sm:max-w-none">
                  ID: {user.id}
                </span>
              </div>

              {/* PHOTO PICKER & PREVIEW */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-900 dark:text-slate-200 block">
                  Profile Avatar
                </label>
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <div className="p-0.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[0.7rem] overflow-hidden bg-slate-900 flex items-center justify-center">
                      {editAvatarUrl ? (
                        <img
                          src={editAvatarUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-white/80" />
                      )}
                    </div>
                  </div>

                  {/* Upload from Device */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-white dark:bg-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/20 transition shadow-sm border border-slate-200 dark:border-white/10 touch-manipulation"
                  >
                    <Upload className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Upload Photo</span>
                  </button>

                  {editAvatarUrl && (
                    <button
                      type="button"
                      onClick={() => setEditAvatarUrl('')}
                      className="text-xs font-bold text-rose-500 hover:underline touch-manipulation"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* PRESET 3D AVATARS */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">
                    Or select a 3D Cyberpunk avatar:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditAvatarUrl(preset.url)}
                        className={`aspect-square rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-sm border touch-manipulation ${
                          editAvatarUrl === preset.url
                            ? 'ring-2 ring-cyan-500 ring-offset-2 border-transparent scale-105'
                            : 'border-slate-200 dark:border-white/10 opacity-75 hover:opacity-100'
                        }`}
                        title={preset.label}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* DISPLAY NAME */}
              <div>
                <label className="text-xs font-black text-slate-900 dark:text-slate-200 block mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your Name"
                  className={`w-full px-3.5 py-2 sm:py-2.5 text-xs font-bold rounded-xl border outline-none transition ${
                    isDay
                      ? 'bg-white border-slate-300 text-slate-950 focus:border-slate-900'
                      : 'bg-white/5 border-white/10 text-white focus:border-cyan-400'
                  }`}
                  required
                />
              </div>

              {/* CITIZEN HANDLE */}
              <div>
                <label className="text-xs font-black text-slate-900 dark:text-slate-200 block mb-1">
                  Citizen Handle (@)
                </label>
                <div className="relative flex items-center">
                  <AtSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) =>
                      setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                    }
                    placeholder="username"
                    className={`w-full pl-9 pr-3.5 py-2 sm:py-2.5 text-xs font-mono font-bold rounded-xl border outline-none transition ${
                      isDay
                        ? 'bg-white border-slate-300 text-slate-950 focus:border-slate-900'
                        : 'bg-white/5 border-white/10 text-white focus:border-cyan-400'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-md transition hover:scale-105 touch-manipulation"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* CLAIM GUEST PURCHASE SECTION */}
          <section className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border ${
            isDay ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-cyan-500/5 border-cyan-500/15'
          }`}>
            <p className="text-xs font-black text-cyan-800 dark:text-cyan-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Claim a Guest Purchase Token
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              Enter your UPS claim token from checkout to link that floor to this citizen profile.
            </p>
            <div className="mt-2.5 flex flex-col sm:flex-row gap-2">
              <input
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value)}
                placeholder="e.g. UPS-ABC123-L4"
                className={`flex-1 px-3 py-2 text-xs font-mono font-bold rounded-xl border outline-none ${
                  isDay
                    ? 'bg-white border-cyan-300 text-slate-900 focus:border-cyan-600'
                    : 'bg-slate-900 border-white/15 text-white focus:border-cyan-400'
                }`}
              />
              <button
                onClick={handleClaimPurchase}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-md transition hover:scale-105 active:scale-95 touch-manipulation"
              >
                Claim
              </button>
            </div>
            {claimMessage && (
              <p className="mt-2 text-[11px] font-bold text-cyan-700 dark:text-cyan-300">
                {claimMessage}
              </p>
            )}
          </section>

          {/* TELEMETRY STATS GRID */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
            <div className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-center border shadow-sm ${
              isDay ? 'bg-slate-100/90 border-slate-200' : 'bg-white/[0.03] border-white/10'
            }`}>
              <span className="text-[9px] sm:text-[10px] uppercase font-mono font-black text-slate-500 dark:text-slate-400 block mb-0.5 truncate">
                Floors Owned
              </span>
              <span className="text-base sm:text-xl font-black text-cyan-600 dark:text-cyan-400">
                {userFloors.length}
              </span>
            </div>
            <div className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-center border shadow-sm ${
              isDay ? 'bg-slate-100/90 border-slate-200' : 'bg-white/[0.03] border-white/10'
            }`}>
              <span className="text-[9px] sm:text-[10px] uppercase font-mono font-black text-slate-500 dark:text-slate-400 block mb-0.5 truncate">
                Daily Views
              </span>
              <span className="text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                {totalImpressions.toLocaleString()}
              </span>
            </div>
            <div className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-center border shadow-sm ${
              isDay ? 'bg-slate-100/90 border-slate-200' : 'bg-white/[0.03] border-white/10'
            }`}>
              <span className="text-[9px] sm:text-[10px] uppercase font-mono font-black text-slate-500 dark:text-slate-400 block mb-0.5 truncate">
                Elevation
              </span>
              <span className="text-base sm:text-xl font-black text-indigo-600 dark:text-indigo-400">
                {userFloors.length * 4.5}m
              </span>
            </div>
          </div>

          {/* OWNED FLOORS LIST */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Your Minted Floors ({userFloors.length})
              </h4>
              <button
                onClick={() => {
                  onClose();
                  onOpenBuild();
                }}
                className="inline-flex items-center gap-1 text-xs font-black text-cyan-600 dark:text-cyan-400 hover:underline touch-manipulation"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mint New Floor</span>
              </button>
            </div>

            {userFloors.length === 0 ? (
              <div className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl text-center space-y-2 border ${
                isDay ? 'bg-slate-100/60 border-slate-200' : 'bg-white/[0.02] border-white/10'
              }`}>
                <Building2 className="w-7 h-7 sm:w-8 sm:h-8 mx-auto text-slate-400" />
                <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                  No Floors Minted Yet
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  You haven&apos;t reserved any billboard floors on the Business Tower skyline.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenBuild();
                  }}
                  className="mt-1.5 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md hover:scale-105 transition active:scale-95 touch-manipulation"
                >
                  Claim Your First Level
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {userFloors.map((floor) => {
                  const displayNum = getDisplayFloorNumber(floor.floorNumber, floors.length);
                  return (
                    <div
                      key={floor.id}
                      className={`flex items-center justify-between p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all hover:scale-[1.01] shadow-sm ${
                        isDay
                          ? 'bg-slate-100/90 border-slate-200 hover:bg-slate-200/90'
                          : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 shrink-0">
                          LVL {displayNum}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-black text-slate-950 dark:text-white truncate">
                            {floor.brandTitle || 'CAMPAIGN ACTIVE'}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {floor.tagline || '360° Billboard Orbit'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
                        <button
                          onClick={() => {
                            onSelectFloor(floor);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-black text-slate-800 dark:text-slate-200 bg-white dark:bg-white/10 hover:bg-cyan-500 hover:text-white transition hover:scale-105 active:scale-95 shadow-sm border border-slate-200 dark:border-white/10 touch-manipulation"
                          title="Fly camera to this floor"
                        >
                          <Compass className="w-3.5 h-3.5 text-cyan-500" />
                          <span className="hidden xs:inline">Fly To</span>
                        </button>
                        {floor.targetUrl && (
                          <a
                            href={floor.targetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg sm:rounded-xl text-slate-400 hover:text-cyan-500 hover:bg-slate-200 dark:hover:bg-white/10 transition"
                            title="Open campaign URL"
                          >
                            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="pt-2.5 sm:pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span className="flex items-center gap-1 font-medium text-[10px] sm:text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>UpSpace Citizen District</span>
          </span>
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition touch-manipulation"
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

