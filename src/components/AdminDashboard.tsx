import React, { useState } from 'react';
import {
  X,
  LayoutDashboard,
  TrendingUp,
  ShieldCheck,
  Tag,
  CreditCard,
  Users,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Trash2,
  Sparkles,
  Building2,
  Car,
  Gamepad2,
  Search,
  Banknote,
} from 'lucide-react';
import {
  Listing,
  UserProfile,
  PaymentTransaction,
  ChatThread,
  Review,
} from '../types/marketplace';
import { formatOMR } from '../utils/logic';
import { saveListings, saveTransactions, getStoredNotifications, saveNotifications } from '../utils/storage';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  listings: Listing[];
  onUpdateListings: (updated: Listing[]) => void;
  users: UserProfile[];
  transactions: PaymentTransaction[];
  onUpdateTransactions: (updated: PaymentTransaction[]) => void;
  threads: ChatThread[];
  reviews: Review[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  listings,
  onUpdateListings,
  users,
  transactions,
  onUpdateTransactions,
  threads,
  reviews,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'negotiations' | 'escrow'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // Calculate high level metrics
  const totalVolumeOMR = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const activeNegotiationsCount = threads.filter((t) => t.activeNegotiation).length;
  const activeListingsCount = listings.filter((l) => l.status === 'active').length;

  // Actions on Listings
  const handleToggleFeatured = (id: string) => {
    const updated = listings.map((l) => (l.id === id ? { ...l, featured: !l.featured } : l));
    onUpdateListings(updated);
    saveListings(updated);
  };

  const handleRemoveListing = (id: string) => {
    const updated = listings.filter((l) => l.id !== id);
    onUpdateListings(updated);
    saveListings(updated);
  };

  const filteredListings = listings.filter((l) =>
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.sellerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#1e1e20] text-zinc-100 rounded-2xl w-full max-w-5xl my-auto overflow-hidden shadow-2xl border border-white/15 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#161618]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e0f252] text-[#111113] flex items-center justify-center shadow-md font-bold">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-oswald uppercase tracking-wider font-bold text-white">
                  SouqOman Administration Console
                </h2>
                <span className="text-[10px] font-mono-tech font-bold bg-[#e0f252]/20 text-[#e0f252] px-2 py-0.5 rounded border border-[#e0f252]/30">
                  Live Moderator
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono-tech">
                Audit marketplace listings, discount negotiations, cash/Venmo handovers, and verified reviews
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close Admin Console"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#161618] border-b border-white/10 px-4 sm:px-6 flex items-center gap-2 overflow-x-auto text-xs font-mono-tech">
          {[
            { id: 'overview', label: 'Overview Analytics' },
            { id: 'listings', label: `Manage Listings (${listings.length})` },
            { id: 'negotiations', label: `Negotiations & Chats (${threads.length})` },
            { id: 'escrow', label: `Handover Deals (${transactions.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3.5 border-b-2 uppercase tracking-wider transition-all whitespace-nowrap font-bold ${
                activeTab === tab.id
                  ? 'border-[#e0f252] text-[#e0f252] bg-white/5'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 font-mono-tech">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-xl bg-[#161618] border border-white/10">
                  <div className="flex items-center justify-between text-zinc-400 mb-2 text-xs">
                    <span>Trading Volume</span>
                    <TrendingUp className="w-4 h-4 text-[#e0f252]" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold font-oswald text-[#e0f252]">
                    {formatOMR(totalVolumeOMR)}
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-1">In-Person Direct Settlements</p>
                </div>

                <div className="p-4 rounded-xl bg-[#161618] border border-white/10">
                  <div className="flex items-center justify-between text-zinc-400 mb-2 text-xs">
                    <span>Live Listings</span>
                    <Sparkles className="w-4 h-4 text-sky-400" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold font-oswald text-white">
                    {activeListingsCount}
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-1">Across 8 Oman cities</p>
                </div>

                <div className="p-4 rounded-xl bg-[#161618] border border-white/10">
                  <div className="flex items-center justify-between text-zinc-400 mb-2 text-xs">
                    <span>Negotiations</span>
                    <Tag className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold font-oswald text-amber-300">
                    {activeNegotiationsCount}
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-1">Live human-to-human talks</p>
                </div>

                <div className="p-4 rounded-xl bg-[#161618] border border-white/10">
                  <div className="flex items-center justify-between text-zinc-400 mb-2 text-xs">
                    <span>Verified Reviews</span>
                    <ShieldCheck className="w-4 h-4 text-[#e0f252]" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold font-oswald text-[#e0f252]">
                    {reviews.length}
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-1">100% Genuine Handover Buyers</p>
                </div>
              </div>

              {/* Activity breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#161618] border border-white/10 space-y-3">
                  <h3 className="text-xs font-oswald uppercase tracking-wider text-[#e0f252] font-bold">
                    Category Distribution
                  </h3>
                  <div className="space-y-2 text-xs">
                    {[
                      { name: 'PlayStation & Gaming Consoles', count: listings.filter(l => l.category === 'gaming').length },
                      { name: 'Places & Real Estate', count: listings.filter(l => l.category === 'places').length },
                      { name: 'Cars & Vehicles', count: listings.filter(l => l.category === 'cars').length },
                      { name: 'Tech & Mobiles', count: listings.filter(l => l.category === 'electronics').length },
                      { name: 'Home & Furniture', count: listings.filter(l => l.category === 'furniture').length },
                    ].map(c => (
                      <div key={c.name} className="flex items-center justify-between">
                        <span className="text-zinc-300">{c.name}</span>
                        <span className="font-bold text-[#e0f252]">{c.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#161618] border border-white/10 space-y-3">
                  <h3 className="text-xs font-oswald uppercase tracking-wider text-[#e0f252] font-bold">
                    Security & Data Integrity
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Website Card Data Leaks:</span>
                      <span className="text-[#e0f252] font-bold">0% (Zero Card Storage Policy)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Handover Settlement:</span>
                      <span className="text-[#e0f252] font-bold">Cash on Delivery / Venmo</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Review Authenticity:</span>
                      <span className="text-white font-bold">Verified Buyer Gate Enforced</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LISTINGS MANAGEMENT */}
          {activeTab === 'listings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title or seller..."
                    className="w-full pl-9 pr-3 py-2 bg-[#161618] border border-white/10 rounded-lg text-xs text-white outline-none focus:border-[#e0f252]"
                  />
                </div>
              </div>

              <div className="border border-white/10 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161618] border-b border-white/10 text-zinc-400 font-bold uppercase">
                    <tr>
                      <th className="p-3">Item</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Seller</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredListings.map((l) => (
                      <tr key={l.id} className="hover:bg-white/5">
                        <td className="p-3 font-semibold text-white max-w-xs truncate">
                          {l.title}
                        </td>
                        <td className="p-3 capitalize text-zinc-300">{l.category}</td>
                        <td className="p-3 font-bold text-[#e0f252] font-oswald text-sm">{formatOMR(l.price)}</td>
                        <td className="p-3 text-zinc-300">{l.sellerName}</td>
                        <td className="p-3 text-zinc-400">{l.sellerPhone}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              l.status === 'active'
                                ? 'bg-[#e0f252]/20 text-[#e0f252]'
                                : l.status === 'sold'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-white/10 text-zinc-300'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => handleToggleFeatured(l.id)}
                            className={`px-2 py-1 rounded text-[11px] font-bold ${
                              l.featured
                                ? 'bg-[#e0f252] text-[#111113]'
                                : 'bg-white/10 text-zinc-300 hover:bg-white/20'
                            }`}
                          >
                            {l.featured ? 'Featured ★' : 'Feature'}
                          </button>
                          <button
                            onClick={() => handleRemoveListing(l.id)}
                            className="p-1 rounded text-rose-400 hover:bg-rose-500/20"
                            title="Remove listing"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: NEGOTIATIONS AUDIT */}
          {activeTab === 'negotiations' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                Audit real-time price negotiations, customer discount requests, and seller counter-offers.
              </p>

              <div className="space-y-3">
                {threads.map((t) => {
                  const neg = t.activeNegotiation;
                  return (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl bg-[#161618] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={t.listingImage}
                          alt="item"
                          className="w-12 h-12 rounded-lg object-cover shrink-0 border border-white/10"
                        />
                        <div>
                          <p className="font-bold text-white font-oswald uppercase text-sm">{t.listingTitle}</p>
                          <p className="text-[11px] text-zinc-400">
                            Buyer: <span className="font-semibold text-zinc-200">{t.buyerName}</span> • Seller: <span className="font-semibold text-zinc-200">{t.sellerName}</span>
                          </p>
                          {neg && (
                            <p className="text-[11px] text-[#e0f252] font-bold mt-0.5">
                              Offered: {formatOMR(neg.offeredPrice)} ({neg.discountPercent}% discount from {formatOMR(neg.originalPrice)})
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {neg && (
                          <span
                            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                              neg.status === 'accepted'
                                ? 'bg-[#e0f252] text-[#111113]'
                                : neg.status === 'countered'
                                ? 'bg-amber-400 text-[#111113]'
                                : neg.status === 'declined'
                                ? 'bg-rose-500 text-white'
                                : 'bg-white/10 text-white'
                            }`}
                          >
                            Status: {neg.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: HANDOVER DEALS */}
          {activeTab === 'escrow' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                Official In-Person Handover records settled via Cash on Delivery or Venmo upon physical inspection.
              </p>

              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 rounded-xl bg-[#161618] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {tx.orderNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-[#e0f252]/20 text-[#e0f252]">
                          {tx.paymentMethod.toUpperCase()} HANDOVER
                        </span>
                      </div>
                      <p className="text-zinc-300 mt-1 font-medium">{tx.listingTitle}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Buyer: {tx.buyerName} ➔ Seller: {tx.sellerName}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-[#e0f252] font-oswald">
                        {formatOMR(tx.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

