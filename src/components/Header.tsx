import React, { useState } from 'react';
import {
  Search,
  Bell,
  MessageSquare,
  PlusCircle,
  ShieldCheck,
  Building2,
  Car,
  Gamepad2,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
  CheckCircle2,
  User,
  LogIn,
  LogOut,
  Crown,
  KeyRound,
} from 'lucide-react';
import { UserProfile, PushNotification } from '../types/marketplace';
import { formatOMR } from '../utils/logic';

interface HeaderProps {
  currentUser: UserProfile | null;
  onOpenAuth: (mode?: 'signin' | 'signup' | 'admin') => void;
  onSignOut: () => void;
  onUnlockAdminKeyword: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onOpenPostAd: () => void;
  onOpenChat: (threadId?: string) => void;
  onOpenAdmin: () => void;
  notifications: PushNotification[];
  onOpenNotification: (notif: PushNotification) => void;
  onClearNotifications: () => void;
  unreadChatCount: number;
  isAdminView: boolean;
  onToggleAdminView: () => void;
}

const OMAN_CITIES = [
  'All Oman',
  'Muscat',
  'Salalah',
  'Sohar',
  'Seeb',
  'Bawshar',
  'Nizwa',
  'Sur',
  'Al Buraimi',
];

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenAuth,
  onSignOut,
  onUnlockAdminKeyword,
  searchQuery,
  onSearchChange,
  selectedCity,
  onSelectCity,
  onOpenPostAd,
  onOpenChat,
  onOpenAdmin,
  notifications,
  onOpenNotification,
  onClearNotifications,
  unreadChatCount,
  isAdminView,
  onToggleAdminView,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showCityMenu, setShowCityMenu] = useState(false);

  const closeAllMenus = () => {
    setShowUserMenu(false);
    setShowNotifMenu(false);
    setShowCityMenu(false);
  };

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-[#161618]/95 backdrop-blur-md border-b border-white/10 shadow-lg text-[#f8f7f4]">
      {(showUserMenu || showNotifMenu || showCityMenu) && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={closeAllMenus}
          aria-hidden="true"
        />
      )}

      {/* Top utility bar */}
      <div className="bg-[#111113] text-zinc-400 text-xs py-1.5 px-4 sm:px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[#e0f252] font-mono-tech text-[11px] font-medium tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#e0f252] shadow-[0_0_8px_#e0f252] inline-block animate-pulse" />
              100% FREE MARKETPLACE
            </span>
            <span className="hidden md:inline text-white/20">|</span>
            <span className="hidden md:inline text-zinc-400 text-[11px]">
              Direct In-Person Handover (Cash / Venmo) • No Online Card Breach Risk
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* User Account / Auth Section */}
            {!currentUser ? (
              <button
                onClick={() => onOpenAuth('signin')}
                className="flex items-center gap-1.5 bg-[#e0f252] hover:bg-[#cbdb40] text-[#111113] px-3 py-1 rounded font-bold text-xs transition-all shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-[#1e1e20] hover:bg-[#262629] text-zinc-200 pl-1.5 pr-2.5 py-1 rounded text-xs font-medium transition-colors border border-white/10"
                  aria-label="User Account Menu"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-5 h-5 rounded-full object-cover border border-white/20"
                  />
                  <span className="text-white font-bold max-w-[120px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  {currentUser.role === 'admin' ? (
                    <span className="bg-[#e0f252]/20 text-[#e0f252] text-[10px] px-1 py-0.2 rounded font-black flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5 text-[#e0f252]" /> Admin
                    </span>
                  ) : (
                    <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1 py-0.2 rounded font-medium hidden sm:inline">
                      Buy & Sell
                    </span>
                  )}
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#1e1e20] text-zinc-100 rounded-2xl shadow-2xl border border-white/15 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/20 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-extrabold text-white truncate">
                            {currentUser.name}
                          </p>
                          {currentUser.role === 'admin' && (
                            <Crown className="w-3.5 h-3.5 text-[#e0f252] shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate">{currentUser.phone}</p>
                        <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.5 bg-[#e0f252]/15 text-[#e0f252] rounded">
                          Unified Trader (Buy & Sell)
                        </span>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenPostAd();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-white/5 hover:text-[#e0f252] rounded-xl transition-colors flex items-center gap-2"
                      >
                        <PlusCircle className="w-4 h-4 text-[#e0f252]" />
                        <span>Post Free Ad (Sell)</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenChat();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-white/5 hover:text-[#e0f252] rounded-xl transition-colors flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4 text-zinc-400" />
                        <span>My Negotiations & Chats</span>
                      </button>

                      {currentUser.role === 'admin' ? (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onOpenAdmin();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-extrabold text-[#e0f252] bg-[#e0f252]/10 hover:bg-[#e0f252]/20 rounded-xl transition-colors flex items-center gap-2"
                        >
                          <Crown className="w-4 h-4 text-[#e0f252]" />
                          <span>Admin Console</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onUnlockAdminKeyword();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-white/5 hover:text-[#e0f252] rounded-xl transition-colors flex items-center gap-2"
                        >
                          <KeyRound className="w-4 h-4 text-zinc-400" />
                          <span>Enter Admin Passcode</span>
                        </button>
                      )}

                      <div className="border-t border-white/10 my-1 pt-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onSignOut();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-1.5 font-mono-tech text-[11px] text-zinc-400">
              <span className="text-[#e0f252] font-bold">OMR</span>
              <span>(Omani Rial)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo in Oswald font */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2.5 group text-decoration-none">
            <div className="w-10 h-10 rounded-lg bg-[#e0f252] flex items-center justify-center text-[#111113] font-oswald text-xl font-bold shadow-lg shadow-[#e0f252]/10 group-hover:scale-105 transition-transform">
              SO
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-oswald text-2xl font-bold tracking-wider text-white uppercase">
                  SOUQ<span className="text-[#e0f252]">OMAN</span>
                </span>
                <span className="text-[10px] font-mono-tech px-1.5 py-0.5 bg-white/10 text-zinc-300 rounded uppercase">
                  سوق عُمان
                </span>
              </div>
              <span className="text-[10px] font-mono-tech text-zinc-400 uppercase tracking-widest">
                Places • Cars • PlayStation & Tech
              </span>
            </div>
          </a>
        </div>

        {/* Search & Location Bar (Desktop & Tablet) */}
        <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-4">
          <div className="flex items-center w-full bg-[#1e1e20] border border-white/15 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-[#e0f252] focus-within:border-[#e0f252] transition-all">
            {/* City selector */}
            <div className="relative">
              <button
                onClick={() => setShowCityMenu(!showCityMenu)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#161618] hover:bg-[#222226] border-r border-white/10 text-xs font-semibold text-zinc-300 whitespace-nowrap transition-colors"
                aria-label="Filter by Oman city"
              >
                <span>{selectedCity}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {showCityMenu && (
                <div className="absolute left-0 mt-2 w-44 bg-[#1e1e20] rounded-xl shadow-2xl border border-white/15 py-1.5 z-50">
                  {OMAN_CITIES.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        onSelectCity(city);
                        setShowCityMenu(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs hover:bg-white/5 hover:text-[#e0f252] ${
                        selectedCity === city ? 'font-bold text-[#e0f252] bg-white/5' : 'text-zinc-300'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-zinc-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search PlayStation 5, Toyota Land Cruiser, Villa Al Mouj, games..."
                className="w-full px-3 py-2.5 bg-transparent text-xs text-white placeholder-zinc-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="mr-3 text-xs text-zinc-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Dashboard toggle */}
          <button
            onClick={onToggleAdminView}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
              isAdminView
                ? 'bg-[#e0f252] text-[#111113] border-[#e0f252] font-bold'
                : 'bg-[#1e1e20] hover:bg-[#262629] text-zinc-300 border-white/10'
            }`}
            aria-label="Open Admin Dashboard"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#e0f252]" />
            <span className="hidden sm:inline font-mono-tech text-[11px] uppercase">Admin</span>
          </button>

          {/* Real-time Chat Inbox */}
          <button
            onClick={() => onOpenChat()}
            className="relative p-2.5 rounded-lg bg-[#1e1e20] hover:bg-[#262629] text-zinc-300 border border-white/10 transition-colors"
            aria-label="Open Real-time Chat & Negotiations"
          >
            <MessageSquare className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-zinc-200" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#e0f252] text-[#111113] text-[10px] font-black rounded-full flex items-center justify-center border border-[#111113] animate-pulse">
                {unreadChatCount}
              </span>
            )}
          </button>

          {/* Push Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2.5 rounded-lg bg-[#1e1e20] hover:bg-[#262629] text-zinc-300 border border-white/10 transition-colors"
              aria-label="View Push Notifications"
            >
              <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-zinc-200" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-[#111113]">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#1e1e20] rounded-2xl shadow-2xl border border-white/15 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-white">
                <div className="px-4 pb-2 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#e0f252]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono-tech">
                      Notifications
                    </span>
                    {unreadNotifs > 0 && (
                      <span className="bg-[#e0f252]/20 text-[#e0f252] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadNotifs} New
                      </span>
                    )}
                  </div>
                  <button
                    onClick={onClearNotifications}
                    className="text-[11px] text-zinc-400 hover:text-[#e0f252] transition-colors"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-zinc-400 text-xs font-mono-tech">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          onOpenNotification(notif);
                          setShowNotifMenu(false);
                        }}
                        className={`p-3.5 hover:bg-white/5 cursor-pointer transition-colors ${
                          !notif.read ? 'bg-[#e0f252]/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              !notif.read ? 'bg-[#e0f252]' : 'bg-transparent'
                            }`}
                          />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-white leading-snug">
                              {notif.title}
                            </p>
                            <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                              {notif.body || notif.message}
                            </p>
                            <span className="text-[10px] text-zinc-500 mt-1 inline-block font-mono-tech">
                              {notif.createdAt || notif.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Post Free Ad CTA Button */}
          <button
            onClick={onOpenPostAd}
            className="flex items-center gap-1.5 bg-[#e0f252] hover:bg-[#cbdb40] text-[#111113] font-oswald uppercase tracking-wider px-3.5 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold shadow-lg shadow-[#e0f252]/10 active:scale-95 transition-all"
            aria-label="Post Free Ad"
          >
            <PlusCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span>Post Free Ad</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Input */}
      <div className="lg:hidden px-4 pb-3">
        <div className="flex items-center w-full bg-[#1e1e20] border border-white/15 rounded-lg overflow-hidden px-3 py-2">
          <Search className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search places, cars, PS5 consoles, games..."
            className="w-full bg-transparent text-xs text-white placeholder-zinc-500 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
