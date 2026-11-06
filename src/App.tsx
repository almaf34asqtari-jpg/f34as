import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { CategoryBar } from './components/CategoryBar';
import { ListingCard } from './components/ListingCard';
import { ListingDetailModal } from './components/ListingDetailModal';
import { DiscountNegotiationModal } from './components/DiscountNegotiationModal';
import { ChatModal } from './components/ChatModal';
import { PaymentCheckoutModal } from './components/PaymentCheckoutModal';
import { PostAdModal } from './components/PostAdModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { NotificationToast } from './components/NotificationToast';
import {
  Listing,
  CategoryId,
  UserProfile,
  Review,
  PaymentTransaction,
  PushNotification,
  ChatThread,
} from './types/marketplace';
import {
  getStoredListings,
  saveListings,
  getStoredUsers,
  saveUsers,
  getCurrentUser,
  setCurrentUserId,
  getStoredReviews,
  getStoredTransactions,
  getStoredNotifications,
  saveNotifications,
  getStoredThreads,
} from './utils/storage';
import {
  filterListings,
  FilterState,
} from './utils/logic';
import {
  ShieldCheck,
  Tag,
  Gamepad2,
  Building2,
  Car,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  PlusCircle,
  Percent,
} from 'lucide-react';

export default function App() {
  // State Initialization from Persistent LocalStorage
  const [listings, setListings] = useState<Listing[]>(getStoredListings());
  const [users, setUsers] = useState<UserProfile[]>(getStoredUsers());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      return getCurrentUser();
    } catch {
      return null;
    }
  });
  const [reviews, setReviews] = useState<Review[]>(getStoredReviews());
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(getStoredTransactions());
  const [notifications, setNotifications] = useState<PushNotification[]>(getStoredNotifications());
  const [threads, setThreads] = useState<ChatThread[]>(getStoredThreads());

  // Search & Filter State
  const [searchQuery, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all');
  const [selectedCity, setSelectedCity] = useState('All Oman');
  const [isNegotiableOnly, setIsNegotiableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'popular'>('newest');
  const [savedListingIds, setSavedListingIds] = useState<string[]>(['item-ps5-slim']);

  // Modals & Popups
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [negotiatingListing, setNegotiatingListing] = useState<Listing | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialThreadId, setChatInitialThreadId] = useState<string | undefined>(undefined);
  const [checkoutListing, setCheckoutListing] = useState<Listing | null>(null);
  const [checkoutAgreedPrice, setCheckoutAgreedPrice] = useState<number | undefined>(undefined);
  const [checkoutDiscountAmount, setCheckoutDiscountAmount] = useState<number | undefined>(undefined);
  const [isPostAdOpen, setIsPostAdOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Authentication Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup' | 'admin'>('signin');
  const [authActionPrompt, setAuthActionPrompt] = useState<string | undefined>(undefined);

  // Elevate directly to Admin when keyword "feras123" is triggered
  const elevateToAdmin = () => {
    const allU = getStoredUsers();
    let admin = allU.find((u) => u.role === 'admin' || u.name.toLowerCase().includes('feras'));
    if (!admin) {
      admin = {
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
      const updatedUsers = [...allU, admin];
      saveUsers(updatedUsers);
      setUsers(updatedUsers);
    } else if (admin.role !== 'admin') {
      admin = { ...admin, role: 'admin' };
      const updatedUsers = allU.map((u) => (u.id === admin!.id ? admin! : u));
      saveUsers(updatedUsers);
      setUsers(updatedUsers);
    }

    setCurrentUser(admin);
    setCurrentUserId(admin.id);

    // Push notification for Admin Mode
    const adminNotif: PushNotification = {
      id: `notif-${Date.now()}`,
      type: 'admin_alert',
      title: '👑 Administrator Access Activated',
      message: 'Secret admin passcode recognized! You are now logged in as Feras (Admin). Full monitoring, moderation, and listing controls activated.',
      timestamp: 'Just now',
      read: false,
    };
    const updatedNotifs = [adminNotif, ...getStoredNotifications()];
    setNotifications(updatedNotifs);
    saveNotifications(updatedNotifs);
    setIsAdminOpen(true);
  };

  // Search input handler with secret keyword interception
  const handleSearchChange = (query: string) => {
    setSearchTerm(query);
    if (query.trim().toLowerCase() === 'feras123') {
      elevateToAdmin();
      setSearchTerm('');
    }
  };

  // Delete listing handler (Authorized strictly for seller or admin)
  const handleDeleteListing = (listingId: string) => {
    const item = listings.find((l) => l.id === listingId);
    if (!item) return;

    if (!currentUser || (currentUser.id !== item.sellerId && currentUser.role !== 'admin')) {
      alert('Unauthorized: Only the seller or an administrator can delete this listing.');
      return;
    }

    const updated = listings.filter((l) => l.id !== listingId);
    setListings(updated);
    saveListings(updated);
    if (selectedListing?.id === listingId) {
      setSelectedListing(null);
    }

    const deleteNotif: PushNotification = {
      id: `notif-${Date.now()}-del`,
      type: 'system',
      title: 'Post Deleted Successfully',
      message: `"${item.title.slice(0, 30)}..." has been permanently removed.`,
      timestamp: 'Just now',
      read: false,
    };
    const newNotifs = [deleteNotif, ...getStoredNotifications()];
    setNotifications(newNotifs);
    saveNotifications(newNotifs);
  };

  // Auth Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setUsers(getStoredUsers());
    setCurrentUserId(user.id);
    setIsAuthOpen(false);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('souq_oman_current_user_id');
  };

  const handleToggleSave = (listingId: string) => {
    setSavedListingIds((prev) =>
      prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [...prev, listingId]
    );
  };

  // Guarded Actions (Require sign in)
  const handleOpenPostAd = () => {
    if (!currentUser) {
      setAuthInitialMode('signin');
      setAuthActionPrompt('Please sign in or create an account to post your free ad.');
      setIsAuthOpen(true);
      return;
    }
    setIsPostAdOpen(true);
  };

  const handleRequestDiscount = (listing: Listing) => {
    if (!currentUser) {
      setAuthInitialMode('signin');
      setAuthActionPrompt(`Please sign in to request a discount on "${listing.title.slice(0, 30)}...".`);
      setIsAuthOpen(true);
      return;
    }
    setNegotiatingListing(listing);
  };

  const handleStartChatFromListing = (listing: Listing) => {
    if (!currentUser) {
      setAuthInitialMode('signin');
      setAuthActionPrompt('Please sign in to chat in real-time with the seller.');
      setIsAuthOpen(true);
      return;
    }
    const existingThread = threads.find(
      (t) => t.listingId === listing.id && (t.buyerId === currentUser.id || t.sellerId === currentUser.id)
    );
    if (existingThread) {
      setChatInitialThreadId(existingThread.id);
    } else {
      setChatInitialThreadId(undefined);
    }
    setSelectedListing(null);
    setIsChatOpen(true);
  };

  const handleBuyNow = (listing: Listing, agreedPrice?: number, discountAmount?: number) => {
    if (!currentUser) {
      setAuthInitialMode('signin');
      setAuthActionPrompt(`Please sign in to securely purchase "${listing.title.slice(0, 30)}..." via Escrow.`);
      setIsAuthOpen(true);
      return;
    }
    setCheckoutListing(listing);
    setCheckoutAgreedPrice(agreedPrice);
    setCheckoutDiscountAmount(discountAmount);
  };

  const handleOpenHeaderChat = (threadId?: string) => {
    if (!currentUser) {
      setAuthInitialMode('signin');
      setAuthActionPrompt('Please sign in to view your chat negotiations.');
      setIsAuthOpen(true);
      return;
    }
    setChatInitialThreadId(threadId);
    setIsChatOpen(true);
  };

  // When offer is sent, open the real-time chat with that thread
  const handleOfferSent = (threadId: string) => {
    setThreads(getStoredThreads());
    setNotifications(getStoredNotifications());
    setChatInitialThreadId(threadId);
    setIsChatOpen(true);
  };

  // Handle successful escrow payment
  const handlePaymentSuccess = (transaction: PaymentTransaction, updatedBuyer: UserProfile) => {
    setTransactions(getStoredTransactions());
    setListings(getStoredListings());
    setCurrentUser(updatedBuyer);
    setNotifications(getStoredNotifications());
  };

  // Review submitted
  const handleReviewSubmitted = (newReview: Review) => {
    setReviews(getStoredReviews());
    setListings(getStoredListings());
    setUsers(getStoredUsers());
    setNotifications(getStoredNotifications());
  };

  // Notification click
  const handleOpenNotification = (notif: PushNotification) => {
    const updated = notifications.map((n) => (n.id === notif.id ? { ...n, read: true } : n));
    setNotifications(updated);
    saveNotifications(updated);

    if (notif.relatedThreadId) {
      setChatInitialThreadId(notif.relatedThreadId);
      setIsChatOpen(true);
    } else if (notif.relatedListingId) {
      const item = listings.find((l) => l.id === notif.relatedListingId);
      if (item) setSelectedListing(item);
    }
  };

  const handleClearNotifications = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  // Filter listings
  const filteredListings = useMemo(() => {
    let result = filterListings(listings, {
      searchQuery,
      category: activeCategory,
      city: selectedCity === 'All Oman' ? 'all' : selectedCity,
      sortBy,
    });

    if (isNegotiableOnly) {
      result = result.filter((l) => l.isNegotiable);
    }

    return result;
  }, [listings, searchQuery, activeCategory, selectedCity, isNegotiableOnly, sortBy]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: listings.length,
      places: 0,
      cars: 0,
      gaming: 0,
      electronics: 0,
      furniture: 0,
    };
    listings.forEach((l) => {
      if (counts[l.category] !== undefined) {
        counts[l.category] += 1;
      }
    });
    return counts;
  }, [listings]);

  // Compute unread chat count for the active user
  const unreadChatCount = useMemo(() => {
    if (!currentUser) return 0;
    return threads
      .filter((t) => t.buyerId === currentUser.id || t.sellerId === currentUser.id)
      .reduce((acc, t) => acc + (t.unreadCount || 0), 0);
  }, [threads, currentUser]);

  return (
    <div className="min-h-screen bg-[#111113] text-[#f8f7f4] flex flex-col font-sans selection:bg-[#e0f252] selection:text-[#111113]">
      {/* Interactive Push Notification Toast System */}
      <NotificationToast
        notifications={notifications}
        onOpenNotification={handleOpenNotification}
      />

      {/* Main Header */}
      <Header
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthInitialMode(mode || 'signin');
          setAuthActionPrompt(undefined);
          setIsAuthOpen(true);
        }}
        onSignOut={handleSignOut}
        onUnlockAdminKeyword={elevateToAdmin}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        onOpenPostAd={handleOpenPostAd}
        onOpenChat={handleOpenHeaderChat}
        onOpenAdmin={() => {
          if (currentUser?.role === 'admin') {
            setIsAdminOpen(true);
          } else {
            setAuthInitialMode('admin');
            setAuthActionPrompt('Please enter the administrator passcode to access the Admin Console.');
            setIsAuthOpen(true);
          }
        }}
        notifications={notifications}
        onOpenNotification={handleOpenNotification}
        onClearNotifications={handleClearNotifications}
        unreadChatCount={unreadChatCount}
        isAdminView={isAdminOpen}
        onToggleAdminView={() => setIsAdminOpen(!isAdminOpen)}
      />

      {/* Hero Welcome Banner (Design Variation 3) */}
      <section className="bg-[#161618] text-white relative overflow-hidden py-10 sm:py-14 border-b border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#e0f252]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#e0f252]/10 border border-[#e0f252]/30 text-[#e0f252] text-xs font-mono-tech font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#e0f252] animate-pulse" />
                <span>Oman's Verified Classifieds • Zero AI Posts</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-oswald uppercase tracking-tight text-white leading-tight">
                Buy & Sell <span className="text-[#e0f252]">Places, Cars, PS5s & Games</span> with Live Negotiations
              </h1>
              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-mono-tech">
                Post free genuine ads across Muscat, Salalah, Sohar, and all Oman. Direct price negotiations, zero card payments to protect privacy, and physical inspection with Cash on Delivery or Venmo handover.
              </p>

              {/* Trust Pillars */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono-tech text-zinc-300">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#e0f252]" />
                  <span>Physical Inspection Handover</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#e0f252]" />
                  <span>Cash / Venmo Negotiable</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#e0f252]" />
                  <span>Verified Buyer Reviews Only</span>
                </div>
              </div>
            </div>

            {/* Quick Hero CTA Card */}
            <div className="bg-[#1e1e20] p-5 sm:p-6 rounded-2xl border border-white/10 max-w-sm w-full space-y-4 shadow-xl">
              <div className="flex items-center justify-between text-xs font-mono-tech">
                <span className="text-zinc-300">Got something to sell?</span>
                <span className="bg-[#e0f252] text-[#111113] font-black text-[10px] px-2 py-0.5 rounded uppercase font-oswald">
                  100% Free
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono-tech leading-relaxed">
                Post your car, property, PS5 console, or gear with your real phone and handover spot in under 2 minutes.
              </p>
              <button
                onClick={handleOpenPostAd}
                className="w-full py-3 px-4 bg-[#e0f252] hover:bg-[#cbdb40] text-[#111113] font-oswald uppercase tracking-wider font-bold text-xs rounded-lg shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Upload Ad Now (Free)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation Bar */}
      <CategoryBar
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        categoryCounts={categoryCounts}
        sortBy={sortBy}
        onChangeSort={setSortBy}
        isNegotiableOnly={isNegotiableOnly}
        onToggleNegotiable={() => setIsNegotiableOnly(!isNegotiableOnly)}
      />

      {/* Main Marketplace Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Results Info Bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-oswald font-bold text-white uppercase tracking-wider">
              {activeCategory === 'all'
                ? 'Featured Oman Marketplace Ads'
                : activeCategory === 'places'
                ? 'Places & Real Estate in Oman'
                : activeCategory === 'cars'
                ? 'Cars & Vehicles in Oman'
                : activeCategory === 'gaming'
                ? 'PlayStation Consoles & Video Games'
                : `${activeCategory} Listings`}
            </h2>
            <p className="text-xs font-mono-tech text-zinc-400 mt-0.5">
              {filteredListings.length === 0
                ? `0 listings found in ${selectedCity}`
                : `Showing ${filteredListings.length} verified listings in ${selectedCity}`}
            </p>
          </div>
        </div>

        {/* Listings Grid or No Results Empty State */}
        {filteredListings.length === 0 ? (
          <div className="py-20 text-center bg-[#1e1e20] rounded-2xl border border-white/10 p-8 shadow-xl max-w-2xl mx-auto my-6 font-mono-tech">
            <div className="w-16 h-16 rounded-2xl bg-[#161618] border border-white/10 flex items-center justify-center mx-auto mb-4 text-[#e0f252]">
              <Search className="w-8 h-8" />
            </div>
            <div className="inline-block px-3 py-1 rounded bg-[#e0f252]/10 border border-[#e0f252]/20 text-[#e0f252] font-bold text-[11px] mb-2 uppercase tracking-wider">
              100% Real User Marketplace
            </div>
            <h3 className="text-2xl font-oswald font-bold text-white uppercase tracking-wider">
              No results found
            </h3>
            <p className="text-xs text-zinc-400 font-arabic text-[#e0f252] font-semibold mt-1">
              لا توجد نتائج حالياً
            </p>
            <p className="text-xs text-zinc-400 mt-3 max-w-md mx-auto leading-relaxed">
              {listings.length === 0
                ? 'No listings have been posted yet. Post your real ad now for free, or be the first to sell in Oman!'
                : "We couldn't find any listings matching your search or filters. Try adjusting your query or post your own ad!"}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleOpenPostAd}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#e0f252] hover:bg-[#cbdb40] text-[#111113] text-xs font-oswald uppercase tracking-wider font-bold rounded-lg shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Your Real Ad Now (Free)</span>
              </button>
              {(searchQuery || activeCategory !== 'all' || selectedCity !== 'All Oman' || isNegotiableOnly) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('all');
                    setSelectedCity('All Oman');
                    setIsNegotiableOnly(false);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white/10 hover:bg-white/15 text-zinc-300 text-xs font-mono-tech font-bold rounded-lg transition-colors border border-white/10"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                currentUser={currentUser}
                onSelect={(item) => setSelectedListing(item)}
                onRequestDiscount={handleRequestDiscount}
                onDeleteListing={handleDeleteListing}
                isSaved={savedListingIds.includes(listing.id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer (Design Variation 3) */}
      <footer className="bg-[#161618] text-zinc-400 text-xs py-8 border-t border-white/10 mt-12 font-mono-tech">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#e0f252] text-[#111113] flex items-center justify-center font-black font-oswald text-xs">
              SO
            </div>
            <span className="font-oswald uppercase text-white tracking-wider font-bold text-sm">SouqOman</span>
            <span className="text-zinc-500">| سوق عُمان المتطور</span>
          </div>

          <p className="text-[11px] text-zinc-500 text-center sm:text-right">
            Sultanate of Oman • Direct In-Person Classifieds (Cash & Venmo Only • Zero Website Card Storage).
          </p>
        </div>
      </footer>

      {/* Modals */}
      {/* 1. Listing Detail Modal */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          isOpen={true}
          onClose={() => setSelectedListing(null)}
          currentUser={currentUser}
          onRequestDiscount={(l) => {
            setSelectedListing(null);
            handleRequestDiscount(l);
          }}
          onStartChat={handleStartChatFromListing}
          onDeleteListing={handleDeleteListing}
          allReviews={reviews}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {/* 2. Discount Negotiation Modal ("Ask for Discount" button) */}
      {negotiatingListing && currentUser && (
        <DiscountNegotiationModal
          listing={negotiatingListing}
          currentUser={currentUser}
          isOpen={true}
          onClose={() => setNegotiatingListing(null)}
          onOfferSent={handleOfferSent}
        />
      )}

      {/* 3. Real-time Chat & Negotiation Modal */}
      {isChatOpen && currentUser && (
        <ChatModal
          isOpen={true}
          onClose={() => setIsChatOpen(false)}
          currentUser={currentUser}
          initialThreadId={chatInitialThreadId}
          onProceedToPayment={(listing, price, discount) => {
            handleBuyNow(listing, price, discount);
          }}
        />
      )}

      {/* 4. Cash / Venmo In-Person Handover Modal */}
      {checkoutListing && currentUser && (
        <PaymentCheckoutModal
          isOpen={true}
          onClose={() => setCheckoutListing(null)}
          listing={checkoutListing}
          currentUser={currentUser}
          agreedPrice={checkoutAgreedPrice}
          discountApplied={checkoutDiscountAmount}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* 5. Free Ad Posting Modal */}
      {isPostAdOpen && currentUser && (
        <PostAdModal
          isOpen={true}
          onClose={() => setIsPostAdOpen(false)}
          currentUser={currentUser}
          onAdCreated={(newAd) => {
            setListings(getStoredListings());
            setSelectedListing(newAd);
          }}
        />
      )}

      {/* 6. Administrative Dashboard */}
      {isAdminOpen && (
        <AdminDashboard
          isOpen={true}
          onClose={() => setIsAdminOpen(false)}
          listings={listings}
          onUpdateListings={(updated) => setListings(updated)}
          users={users}
          transactions={transactions}
          onUpdateTransactions={(updated) => setTransactions(updated)}
          threads={threads}
          reviews={reviews}
        />
      )}

      {/* 7. Unified Authentication Modal & Admin Unlock */}
      {isAuthOpen && (
        <AuthModal
          isOpen={true}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          initialMode={authInitialMode}
          actionPrompt={authActionPrompt}
        />
      )}
    </div>
  );
}
