import React, { useState } from 'react';
import {
  X,
  MapPin,
  Tag,
  Star,
  ShieldCheck,
  MessageCircle,
  Building2,
  Car,
  Gamepad2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  Share2,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Send,
  MessageSquare,
} from 'lucide-react';
import { Listing, UserProfile, Review } from '../types/marketplace';
import { formatOMR, calculateDiscountPercent, isUserVerifiedPurchaser } from '../utils/logic';
import { submitVerifiedReview } from '../utils/storage';

interface ListingDetailModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onRequestDiscount: (listing: Listing) => void;
  onStartChat: (listing: Listing) => void;
  onDeleteListing?: (listingId: string) => void;
  allReviews: Review[];
  onReviewSubmitted: (newReview: Review) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  isOpen,
  onClose,
  currentUser,
  onRequestDiscount,
  onStartChat,
  onDeleteListing,
  allReviews,
  onReviewSubmitted,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([
    'Item As Described',
    'Fair Handover & Price',
  ]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  if (!isOpen || !listing) return null;

  // Check if viewing own listing or admin
  const isOwner = Boolean(currentUser && listing.sellerId === currentUser.id);
  const isAdmin = currentUser?.role === 'admin';
  const canDelete = isOwner || isAdmin;

  // Filter reviews for this seller
  const sellerReviews = allReviews.filter((r) => r.sellerId === listing.sellerId);

  // Verified purchaser check
  const isVerifiedPurchaser = currentUser
    ? isUserVerifiedPurchaser(
        currentUser.verifiedPurchaserIds || [],
        listing.id,
        currentUser.id,
        listing.sellerId
      )
    : false;

  const discount = listing.originalPrice
    ? calculateDiscountPercent(listing.originalPrice, listing.price)
    : 0;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setReviewError('You must be signed in to submit a review.');
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError('Please write your genuine review comments.');
      return;
    }

    setReviewSubmitting(true);
    setReviewError(null);

    try {
      const newReview = submitVerifiedReview({
        buyer: currentUser,
        listing,
        rating: reviewRating,
        comment: reviewComment.trim(),
        criteriaTags: selectedCriteria,
      });

      setReviewSubmitting(false);
      setReviewSuccess(true);
      setReviewComment('');
      onReviewSubmitted(newReview);
    } catch (err: any) {
      setReviewError(err?.message || 'Failed to submit review.');
      setReviewSubmitting(false);
    }
  };

  const handleDeletePost = () => {
    if (window.confirm(`Are you sure you want to delete this listing ("${listing.title}")? This will permanently remove it from SouqOman.`)) {
      onDeleteListing?.(listing.id);
      onClose();
    }
  };

  const rawPhone = listing.sellerPhone.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#1e1e20] text-zinc-100 rounded-2xl w-full max-w-4xl my-auto overflow-hidden shadow-2xl border border-white/15 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#161618]">
          <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400">
            {/* Back button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs mr-2 font-mono-tech"
            >
              <ArrowLeft className="w-4 h-4 text-[#e0f252]" />
              <span className="font-bold">Back</span>
            </button>
            <span className="uppercase text-[#e0f252]">{listing.category}</span>
            <span>/</span>
            <span>{listing.city}</span>
            <span>/</span>
            <span className="truncate max-w-[200px] text-white font-bold">{listing.title}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* SELLER & ADMIN DELETE BUTTON (BUYER CANNOT DELETE) */}
            {canDelete && (
              <button
                type="button"
                onClick={handleDeletePost}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600 border border-red-500/40 hover:border-red-600 text-red-300 hover:text-white rounded-lg text-xs font-mono-tech font-bold transition-all"
                title="Delete this listing"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Post</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* RED FRAUD / DATA BREACH PREVENTION WARNING */}
          <div className="p-4 rounded-xl bg-red-950/40 border-2 border-red-500 text-red-200 space-y-1 shadow-lg">
            <div className="flex items-center gap-2 font-bold text-xs text-red-400 uppercase tracking-wide font-mono-tech">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>SECURITY NOTICE: ZERO WEBSITE CARD PAYMENTS • CASH / VENMO ONLY</span>
            </div>
            <p className="text-[11px] leading-relaxed text-red-200">
              To guarantee complete data privacy and prevent credit card leaks, <strong>this website does NOT accept card payments</strong>. All trades must be settled via <strong>Cash on Handover</strong> or <strong>Venmo</strong> when meeting the seller in Oman and inspecting the item in person.
            </p>
          </div>

          {/* Photos & Main Info Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Gallery (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-[#161618] border border-white/10">
                <img
                  src={listing.images[activeImageIndex] || listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                {discount > 0 && (
                  <span className="absolute top-3 left-3 bg-[#e0f252] text-[#111113] text-xs font-oswald uppercase tracking-wider font-bold px-2.5 py-1 rounded shadow-md">
                    -{discount}% Valuation
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {listing.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        activeImageIndex === idx
                          ? 'border-[#e0f252]'
                          : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price & Seller Card (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div>
                <h1 className="font-oswald text-xl sm:text-2xl font-bold text-white uppercase tracking-wide leading-tight">
                  {listing.title}
                </h1>
                <p className="text-xs font-mono-tech text-zinc-400 mt-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#e0f252] shrink-0" />
                  <span>{listing.location}, {listing.city}</span>
                </p>

                {/* Price Display */}
                <div className="mt-4 p-4 rounded-xl bg-[#161618] border border-white/10">
                  <div className="flex items-baseline gap-2">
                    <span className="font-oswald text-3xl sm:text-4xl font-bold text-[#e0f252]">
                      {formatOMR(listing.price)}
                    </span>
                    {listing.originalPrice && listing.originalPrice > listing.price && (
                      <span className="font-mono-tech text-sm text-zinc-500 line-through">
                        {formatOMR(listing.originalPrice)}
                      </span>
                    )}
                  </div>
                  {listing.isNegotiable && (
                    <p className="text-[11px] font-mono-tech text-[#e0f252] font-semibold mt-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Negotiable for in-person Cash / Venmo settlement
                    </p>
                  )}
                </div>
              </div>

              {/* Seller Contact & Handover Card */}
              <div className="p-4 rounded-xl bg-[#161618] border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={listing.sellerAvatar}
                    alt={listing.sellerName}
                    className="w-12 h-12 rounded-full object-cover border border-white/20"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h2 className="text-sm font-bold text-white truncate font-oswald uppercase">
                        {listing.sellerName}
                      </h2>
                      {listing.sellerVerified && (
                        <ShieldCheck className="w-4 h-4 text-[#e0f252] shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-zinc-400 font-mono-tech">
                      <div className="flex items-center gap-0.5 text-[#e0f252]">
                        <Star className="w-3.5 h-3.5 fill-[#e0f252]" />
                        <span>{listing.sellerRating.toFixed(1)}</span>
                      </div>
                      <span>•</span>
                      <span>Verified Seller</span>
                    </div>
                  </div>
                </div>

                {/* Seller Phone & Location Display */}
                <div className="p-2.5 rounded-lg bg-[#1e1e20] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono-tech">
                    <span className="text-zinc-400">Seller Phone:</span>
                    <a
                      href={`tel:${listing.sellerPhone}`}
                      className="text-white font-bold hover:text-[#e0f252] flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-[#e0f252]" />
                      <span>{listing.sellerPhone}</span>
                    </a>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono-tech">
                    <span className="text-zinc-400">Handover Spot:</span>
                    <span className="text-zinc-200 truncate max-w-[170px] font-medium">
                      {listing.location}
                    </span>
                  </div>

                  {/* Direct Contact Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`tel:${listing.sellerPhone}`}
                      className="py-1.5 px-2 bg-white/10 hover:bg-white/20 text-white text-center text-xs font-mono-tech rounded font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-[#e0f252]" />
                      <span>Call Seller</span>
                    </a>
                    <a
                      href={`https://wa.me/${rawPhone}?text=Salam%20${encodeURIComponent(listing.sellerName)},%20I%20am%20interested%20in%20your%20listing%20"${encodeURIComponent(listing.title)}"%20on%20SouqOman.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-2 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/30 text-emerald-300 text-center text-xs font-mono-tech rounded font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-400" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Request Discount, Chat, Delete */}
              <div className="space-y-2">
                {isOwner ? (
                  <div className="p-3.5 rounded-xl bg-[#161618] border border-white/15 text-center space-y-2">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#e0f252] font-mono-tech uppercase">
                      <ShieldCheck className="w-4 h-4 text-[#e0f252]" />
                      <span>Your Active Listing (Seller View)</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-mono-tech">
                      You are the verified owner. Buyers will call your phone or message you to negotiate cash/Venmo handover.
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => onStartChat(listing)}
                        className="py-2.5 px-3 rounded-lg font-oswald uppercase tracking-wider font-bold text-xs bg-white text-[#111113] hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Inquiries</span>
                      </button>
                      <button
                        onClick={handleDeletePost}
                        className="py-2.5 px-3 rounded-lg font-oswald uppercase tracking-wider font-bold text-xs bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Ad</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onRequestDiscount(listing)}
                      className="w-full py-3 px-4 rounded-lg font-oswald uppercase tracking-wider font-bold text-sm bg-[#e0f252] hover:bg-[#cbdb40] text-[#111113] shadow-lg shadow-[#e0f252]/10 flex items-center justify-center gap-2 active:scale-98 transition-all"
                    >
                      <Tag className="w-4 h-4" />
                      <span>Request Discount / Propose Cash Offer</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onStartChat(listing)}
                        className="py-2.5 px-3 rounded-lg font-oswald uppercase tracking-wider font-bold text-xs bg-white text-[#111113] hover:bg-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Real-time Chat</span>
                      </button>

                      <a
                        href={`tel:${listing.sellerPhone}`}
                        className="py-2.5 px-3 rounded-lg font-oswald uppercase tracking-wider font-bold text-xs bg-[#161618] hover:bg-white/10 text-white flex items-center justify-center gap-1.5 transition-colors border border-white/15 text-center"
                      >
                        <Phone className="w-4 h-4 text-[#e0f252]" />
                        <span>Direct Call</span>
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-xl bg-[#161618] border border-white/10">
            <h2 className="text-xs font-oswald uppercase tracking-wider text-[#e0f252] mb-1.5">
              Description & Handover Details
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line font-mono-tech">
              {listing.description}
            </p>
          </div>

          {/* Reviews Section */}
          <div className="p-5 rounded-xl bg-[#161618] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-oswald text-base font-bold text-white uppercase tracking-wider">
                  Verified In-Person Handover Reviews
                </h2>
                <p className="text-xs font-mono-tech text-zinc-400">
                  Reviews submitted exclusively by buyers who completed transactions.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                <Star className="w-4 h-4 text-[#e0f252] fill-[#e0f252]" />
                <span className="font-oswald text-base font-bold text-white">
                  {listing.sellerRating.toFixed(1)}
                </span>
                <span className="text-xs font-mono-tech text-zinc-400">({sellerReviews.length})</span>
              </div>
            </div>

            {/* Review submission or info */}
            {isVerifiedPurchaser ? (
              <form onSubmit={handleReviewSubmit} className="p-4 rounded-xl bg-[#1e1e20] border border-white/10 space-y-3">
                <h3 className="font-oswald text-xs uppercase text-white font-bold">Leave Your Review</h3>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience inspecting and paying the seller in person..."
                  className="w-full px-3 py-2 bg-[#161618] border border-white/15 rounded-lg text-xs text-white outline-none focus:border-[#e0f252] resize-none"
                  rows={2}
                />
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-4 py-2 bg-[#e0f252] text-[#111113] font-oswald uppercase font-bold text-xs rounded-lg"
                >
                  Submit Verified Review
                </button>
              </form>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#1e1e20] border border-white/5 text-[11px] font-mono-tech text-zinc-400">
                ⭐ Reviews are reserved for genuine purchasers who agreed on handover with the seller.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
