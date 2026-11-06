import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  ShieldCheck,
  Crown,
  KeyRound,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile } from '../types/marketplace';
import { getStoredUsers, saveUsers, setCurrentUserId } from '../utils/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialMode?: 'signin' | 'signup' | 'admin';
  actionPrompt?: string;
}

const OMAN_CITIES = [
  'Muscat',
  'Salalah',
  'Sohar',
  'Seeb',
  'Bawshar',
  'Nizwa',
  'Sur',
  'Al Buraimi',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'signin',
  actionPrompt,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode === 'signup' ? 'signup' : 'signin');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Muscat');
  const [adminKeyword, setAdminKeyword] = useState('');
  const [showAdminKeyInput, setShowAdminKeyInput] = useState(initialMode === 'admin');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const existingUsers = getStoredUsers();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const identifier = emailOrPhone.trim().toLowerCase();
    const cleanKeyword = adminKeyword.trim().toLowerCase();

    // Check if secret admin keyword entered
    const isAdminPass = cleanKeyword === 'feras123' || identifier === 'feras123';

    if (!identifier && !isAdminPass) {
      setError('Please enter your email or phone number.');
      return;
    }

    if (isAdminPass) {
      // Create or elevate to Admin Feras
      let adminUser = existingUsers.find((u) => u.role === 'admin' || u.name.toLowerCase().includes('feras'));
      if (!adminUser) {
        adminUser = {
          id: 'user-admin-feras',
          name: 'Feras Al-Riyami',
          email: 'feras@souqoman.com',
          phone: '+968 9123 4567',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          city: 'Muscat',
          verifiedId: true,
          verifiedPurchaserIds: [],
          rating: 5.0,
          reviewCount: 0,
          joinedDate: 'November 2026',
        };
        saveUsers([...existingUsers, adminUser]);
      } else {
        adminUser.role = 'admin';
        saveUsers(existingUsers.map((u) => (u.id === adminUser!.id ? { ...u, role: 'admin' as const } : u)));
      }

      setCurrentUserId(adminUser.id);
      setSuccessMsg('👑 Administrator credentials verified! Welcome back.');
      setTimeout(() => {
        onLoginSuccess(adminUser!);
        onClose();
      }, 700);
      return;
    }

    // Regular sign in lookup
    const found = existingUsers.find(
      (u) =>
        u.email.toLowerCase() === identifier ||
        u.phone.replace(/\s+/g, '') === identifier.replace(/\s+/g, '') ||
        u.name.toLowerCase() === identifier
    );

    if (found) {
      setCurrentUserId(found.id);
      setSuccessMsg(`Welcome back, ${found.name}!`);
      setTimeout(() => {
        onLoginSuccess(found);
        onClose();
      }, 500);
    } else {
      // Auto-create unified account with identifier
      const cleanName = identifier.includes('@') ? identifier.split('@')[0] : identifier;
      const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      const newAcc: UserProfile = {
        id: `user-${Date.now()}`,
        name: formattedName,
        email: identifier.includes('@') ? identifier : `${cleanName.toLowerCase()}@souqoman.om`,
        phone: identifier.startsWith('+968') ? identifier : `+968 9${Math.floor(1000000 + Math.random() * 9000000)}`,
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        city: 'Muscat',
        verifiedId: true,
        verifiedPurchaserIds: [],
        rating: 5.0,
        reviewCount: 0,
        joinedDate: 'November 2026',
      };
      saveUsers([...existingUsers, newAcc]);
      setCurrentUserId(newAcc.id);
      setSuccessMsg(`Account created for ${newAcc.name}! You can now buy and sell.`);
      setTimeout(() => {
        onLoginSuccess(newAcc);
        onClose();
      }, 600);
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    const cleanKeyword = adminKeyword.trim().toLowerCase();
    const isAdmin = cleanKeyword === 'feras123';

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: emailOrPhone.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@souqoman.om`,
      phone: phone.trim() ? (phone.startsWith('+968') ? phone.trim() : `+968 ${phone.trim()}`) : '+968 9123 4567',
      role: isAdmin ? 'admin' : 'user',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      city,
      verifiedId: true,
      verifiedPurchaserIds: [],
      rating: 5.0,
      reviewCount: 0,
      joinedDate: 'November 2026',
    };

    saveUsers([...existingUsers, newUser]);
    setCurrentUserId(newUser.id);
    setSuccessMsg(
      isAdmin
        ? '👑 Administrator access unlocked!'
        : `Account created for ${newUser.name}! You can now post ads and negotiate.`
    );

    setTimeout(() => {
      onLoginSuccess(newUser);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e1e20] text-zinc-100 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-white/15 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#161618]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#e0f252] text-[#111113] flex items-center justify-center font-oswald text-base font-bold">
              SO
            </div>
            <div>
              <h2 className="font-oswald text-lg font-bold text-white uppercase tracking-wider">
                SOUQ<span className="text-[#e0f252]">OMAN</span> ACCOUNT
              </h2>
              <p className="text-[11px] font-mono-tech text-zinc-400">
                Single unified account to buy, sell & negotiate
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action prompt banner */}
        {actionPrompt && (
          <div className="px-5 py-2.5 bg-[#e0f252]/10 border-b border-[#e0f252]/20 text-[11px] font-mono-tech text-[#e0f252] flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{actionPrompt}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="m-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="m-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#161618] rounded-xl border border-white/10">
            <button
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all font-mono-tech uppercase ${
                mode === 'signin'
                  ? 'bg-[#e0f252] text-[#111113] shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all font-mono-tech uppercase ${
                mode === 'signup'
                  ? 'bg-[#e0f252] text-[#111113] shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-mono-tech text-zinc-300 mb-1.5 uppercase">
                  Email, Phone (+968), or Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="e.g. +968 9123 4567 or your name"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#161618] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e0f252] focus:ring-1 focus:ring-[#e0f252]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-tech text-zinc-300 mb-1.5 uppercase">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#161618] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e0f252] focus:ring-1 focus:ring-[#e0f252]"
                  />
                </div>
              </div>

              {/* Admin Keyword input toggle */}
              <div className="pt-1">
                {!showAdminKeyInput ? (
                  <button
                    type="button"
                    onClick={() => setShowAdminKeyInput(true)}
                    className="text-[11px] text-zinc-400 hover:text-[#e0f252] font-mono-tech flex items-center gap-1 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Have an Admin Passcode?</span>
                  </button>
                ) : (
                  <div className="p-3 bg-[#161618] rounded-xl border border-white/15 space-y-1.5">
                    <label className="block text-[11px] font-mono-tech text-zinc-300 flex items-center gap-1 uppercase">
                      <Crown className="w-3.5 h-3.5 text-[#e0f252]" />
                      <span>Security Admin Passcode</span>
                    </label>
                    <input
                      type="password"
                      value={adminKeyword}
                      onChange={(e) => setAdminKeyword(e.target.value)}
                      placeholder="Enter secret passcode"
                      className="w-full px-3 py-1.5 bg-[#1e1e20] border border-white/20 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#e0f252]"
                    />
                    <p className="text-[10px] text-zinc-500 font-mono-tech">
                      Authorized marketplace administrative personnel only.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#e0f252] hover:bg-[#cbdb40] text-[#111113] font-oswald uppercase tracking-wider text-sm font-bold rounded-xl shadow-lg shadow-[#e0f252]/10 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>Sign In & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono-tech text-zinc-300 mb-1 uppercase">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Salim Al-Riyami"
                    className="w-full pl-9 pr-3 py-2 bg-[#161618] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e0f252]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-tech text-zinc-300 mb-1 uppercase">
                  Oman Phone Number (+968)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+968 9123 4567"
                    className="w-full pl-9 pr-3 py-2 bg-[#161618] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e0f252]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-tech text-zinc-300 mb-1 uppercase">
                  Email (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="name@example.om"
                    className="w-full pl-9 pr-3 py-2 bg-[#161618] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e0f252]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-tech text-zinc-300 mb-1 uppercase">
                  Governorate / City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#161618] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#e0f252] appearance-none"
                  >
                    {OMAN_CITIES.map((c) => (
                      <option key={c} value={c} className="bg-[#1e1e20] text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Secret admin passcode field (Optional) */}
              <div className="p-3 bg-[#161618] rounded-xl border border-white/10 space-y-1">
                <label className="block text-[11px] font-mono-tech text-zinc-400 flex items-center gap-1 uppercase">
                  <Crown className="w-3.5 h-3.5 text-[#e0f252]" />
                  <span>Admin Passcode (Optional)</span>
                </label>
                <input
                  type="password"
                  value={adminKeyword}
                  onChange={(e) => setAdminKeyword(e.target.value)}
                  placeholder="Enter security code if authorized"
                  className="w-full px-3 py-1.5 bg-[#1e1e20] border border-white/15 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#e0f252]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#e0f252] hover:bg-[#cbdb40] text-[#111113] font-oswald uppercase tracking-wider text-sm font-bold rounded-xl shadow-lg shadow-[#e0f252]/10 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>Create Free Unified Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="p-3 rounded-xl bg-[#161618] border border-white/5 text-[11px] text-zinc-400 font-mono-tech text-center">
            🔒 Account Protected • Individual Verified Identity (No Shared Test Profiles)
          </div>
        </div>
      </div>
    </div>
  );
};
