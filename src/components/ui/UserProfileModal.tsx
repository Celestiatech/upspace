'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Mail,
  ShieldCheck,
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

// Curated Cyberpunk / High-Tech avatar presets
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
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

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editAvatarUrl, setEditAvatarUrl] = useState(user?.avatarUrl || '');
  const [copiedId, setCopiedId] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
    const cleanUsername = editUsername.trim().replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_]/g, '') || user.username;
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
      console.error('Sign out error:', e);
    }
    logout();
    onClose();
  };

  const isDay = theme === 'day';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md animate-in fade-in duration-200 select-none ${isDay ? '' : 'dark'}`}>
      {/* Seamless borderless popup panel */}
      <div className="w-full max-w-2xl rounded-3xl p-6 text-slate-100 animate-in zoom-in-95 duration-200 shadow-2xl bg-white/95 dark:bg-[#0b1024]/95 backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header (borderless) */}
        <header className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <span className="rounded-xl bg-cyan-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              CITIZEN PROFILE
            </span>
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              UpSpace Identity &amp; Assets
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close profile"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Save success toast */}
        {saveSuccess && (
          <div className="mt-2 p-3 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Profile photo and identity updated successfully!</span>
          </div>
        )}

        {/* User Identity Hero Card (borderless) */}
        {!isEditing ? (
          <div className="mt-3 p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-slate-100/80 to-indigo-500/10 dark:from-cyan-950/40 dark:via-slate-900/60 dark:to-indigo-950/40 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                {/* Avatar with click to edit */}
                <div
                  onClick={() => {
                    setEditName(user.name);
                    setEditUsername(user.username);
                    setEditAvatarUrl(user.avatarUrl || '');
                    setIsEditing(true);
                  }}
                  className="relative group/avatar cursor-pointer flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md p-2 overflow-hidden"
                  title="Click to edit profile photo"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <User className="h-full w-full text-white" strokeWidth={2.2} />
                  )}
                  {/* Hover edit overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  {/* Active ping */}
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                  </span>
                </div>

                {/* Identity Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                      {user.name}
                    </h3>
                    <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg">
                      @{user.username}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{user.email}</span>
                  </div>

                  {/* Citizen ID Badge with copy */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={handleCopyId}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-slate-200/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                      title="Click to copy Citizen ID"
                    >
                      <IdCard className="w-3.5 h-3.5 text-cyan-500" />
                      <span>ID: <b>{user.id}</b></span>
                      {copiedId ? <Check className="w-3 h-3 text-emerald-500 ml-1" /> : <Copy className="w-3 h-3 text-slate-400 ml-1" />}
                    </button>
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                      {user.provider === 'google' ? 'Google Linked' : `${user.provider} Auth`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setEditName(user.name);
                    setEditUsername(user.username);
                    setEditAvatarUrl(user.avatarUrl || '');
                    setIsEditing(true);
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 transition shadow-sm hover:scale-105 active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition shadow-sm hover:scale-105 active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Profile Edit Mode (borderless) */
          <form onSubmit={handleSaveProfile} className="mt-3 p-5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 shadow-lg space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-500" />
                <span>Customize Profile &amp; Photo</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">ID: {user.id}</span>
            </div>

            {/* Profile Photo Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Profile Photo</label>
              <div className="flex flex-wrap items-center gap-3">
                {/* Current preview */}
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow overflow-hidden p-1">
                  {editAvatarUrl ? (
                    <img src={editAvatarUrl} alt="Preview" className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <User className="h-7 w-7 text-white" />
                  )}
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Upload Image</span>
                </button>

                {/* Clear Photo */}
                {editAvatarUrl && (
                  <button
                    type="button"
                    onClick={() => setEditAvatarUrl('')}
                    className="text-xs text-rose-500 hover:underline font-semibold"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              {/* Preset Avatars */}
              <div className="pt-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1.5 font-medium">Or choose a preset avatar:</span>
                <div className="flex items-center gap-2">
                  {PRESET_AVATARS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditAvatarUrl(preset)}
                      className={`h-9 w-9 rounded-xl overflow-hidden transition hover:scale-110 shadow-sm ${
                        editAvatarUrl === preset ? 'ring-2 ring-cyan-500 scale-105' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt={`Preset ${idx}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Display Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 shadow-inner"
                required
              />
            </div>

            {/* Username Handle */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Username Handle (@)</label>
              <div className="relative flex items-center">
                <AtSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="username"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 font-mono shadow-inner"
                  required
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Only lowercase letters, numbers, and underscores.</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-md shadow-cyan-500/20 transition hover:scale-105"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        )}

        {/* Telemetry Stats Grid (borderless) */}
        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 text-center shadow-sm">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1">Floors Owned</span>
            <span className="text-xl font-black text-cyan-600 dark:text-cyan-400">{userFloors.length}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 text-center shadow-sm">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1">Daily Views</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{totalImpressions.toLocaleString()}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 text-center shadow-sm">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1">Tower Elevation</span>
            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{userFloors.length * 4.5}m</span>
          </div>
        </div>

        {/* Owned Floors & Billboards List (borderless) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Your Minted Floors ({userFloors.length})
            </h4>
            <button
              onClick={() => {
                onClose();
                onOpenBuild();
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mint New Floor</span>
            </button>
          </div>

          {userFloors.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-100/60 dark:bg-slate-900/50 text-center space-y-2">
              <Building2 className="w-8 h-8 mx-auto text-slate-400" />
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">No Floors Minted Yet</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                You haven&apos;t reserved any billboard floors in the Business Tower.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenBuild();
                }}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md hover:scale-105 transition"
              >
                Build Next Level
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {userFloors.map((floor) => {
                const displayNum = getDisplayFloorNumber(floor.floorNumber, floors.length);
                return (
                  <div
                    key={floor.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-850 transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
                        LVL {displayNum}
                      </span>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {floor.brandTitle || 'CAMPAIGN ACTIVE'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                          {floor.tagline || 'Interactive 3D Billboard'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onSelectFloor(floor);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-cyan-500 hover:text-white transition hover:scale-105 shadow-sm"
                        title="Fly camera to this floor"
                      >
                        <Compass className="w-3.5 h-3.5 text-cyan-500" />
                        <span className="hidden sm:inline">Fly To</span>
                      </button>
                      {floor.targetUrl && (
                        <a
                          href={floor.targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Open campaign URL"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer (borderless) */}
        <div className="mt-5 pt-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>UpSpace City District · Single Unified Account</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
