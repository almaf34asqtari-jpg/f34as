import React, { useState } from 'react';
import {
  X,
  Tag,
  Send,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Percent,
  ArrowLeft,
  AlertTriangle,
  Banknote,
} from 'lucide-react';
import { Listing, UserProfile } from '../types/marketplace';
import {
  formatOMR,
  calculateDiscountPercent,
  calculatePriceFromDiscount,
  isValidOfferPrice,
} from '../utils/logic';
import { sendDiscountOffer } from '../utils/storage';

interface DiscountNegotiationModalProps {
  listing: Listing | null;
  currentUser: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onOfferSent: (threadId: string) => void;
}

export const DiscountNegotiationModal: React.FC<DiscountNegotiationModalProps> = ({
  listing,
  currentUser,
  isOpen,
  onClose,
  onOfferSent,
}) => {
  const originalPrice = listing ? listing.price : 100;
  const defaultDiscount = 10;
  const initialOfferedPrice = Math.round(calculatePriceFromDiscount(originalPrice, defaultDiscount));

  const [offeredPrice, setOfferedPrice] = useState<number>(initialOfferedPrice);
  const [discountPercent, setDiscountPercent] = useState<number>(defaultDiscount);
  const [customMessage, setCustomMessage] = useState<string>(
    listing
      ? `Salam ${listing.sellerName}, I am very interested in your "${listing.title.slice(0, 30)}...". Would you consider ${initialOfferedPrice} OMR for in-person cash/Venmo handover?`
      : ''
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !listing || !currentUser) return null;

  const isSellerSelf = currentUser.id === listing.sellerId;

  // Handle Preset Click
  const handleSelectPreset = (percent: number) => {
    const newPrice = Math.round(calculatePriceFromDiscount(originalPrice, percent));
    setDiscountPercent(percent);
    setOfferedPrice(newPrice);
    setError(null);
    setCustomMessage(
      `Salam ${listing.sellerName}, would you accept ${newPrice} OMR (${percent}% discount)? I am ready for in-person cash handover or Venmo exchange in ${listing.city}.`
    );
  };

  // Handle Manual Price Input
  const handlePriceChange = (valStr: string) => {
    const val = parseFloat(valStr);
    if (isNaN(val)) {
      setOfferedPrice(0);
      setDiscountPercent(0);
      return;
    }
    setOfferedPrice(val);
    const pct = calculateDiscountPercent(originalPrice, val);
    setDiscountPercent(pct);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSellerSelf) {
      setError('You are the seller of this listing and cannot submit a discount request to yourself.');
      return;
    }

    const validation = isValidOfferPrice(originalPrice, offeredPrice);
    if (!validation.valid) {
      setError(validation.error || 'Please enter a valid discounted price');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { thread } = sendDiscountOffer({
        listing,
        buyer: currentUser,
        offeredPrice,
        discountPercent,
        message: customMessage.trim(),
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsSubmitting(false);
        onClose();
        onOfferSent(thread.id);
      }, 900);
    } catch (err: any) {
      setError(err?.message || 'Failed to send discount offer. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e1e20] text-zinc-100 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-white/15 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Modal Header with Back Button */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#161618]">
          <div className="flex items-center gap-2.5">
            {/* Back Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono-tech"
              title="Go back to listing"
            >
              <ArrowLeft className="w-4 h-4 text-[#e0f252]" />
              <span className="hidden sm:inline font-bold">Back</span>
            </button>

            <div className="w-8 h-8 rounded-lg bg-[#e0f252] text-[#111113] flex items-center justify-center font-bold">
              <Tag className="w-4 h-4 text-[#111113]" />
            </div>
            <div>
              <h2 className="font-oswald text-base sm:text-lg font-bold text-white uppercase tracking-wider">
                Request Discount & Negotiate
              </h2>
              <p className="text-[11px] font-mono-tech text-zinc-400">
                Direct offer to seller: <span className="text-[#e0f252]">{listing.sellerName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#e0f252]/20 text-[#e0f252] flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-oswald text-xl font-bold text-white uppercase tracking-wider">
              Offer Sent Successfully!
            </h3>
            <p className="text-xs text-zinc-300 mt-2 max-w-sm leading-relaxed">
              Your discount offer of <span className="font-bold text-[#e0f252]">{formatOMR(offeredPrice)}</span> has been delivered to {listing.sellerName}. Opening direct negotiation chat...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
            {/* RED SECURITY WARNING NOTE */}
            <div className="p-3.5 rounded-xl bg-red-950/40 border-2 border-red-500 text-red-200 space-y-1.5 shadow-md">
              <div className="flex items-center gap-2 font-bold text-xs text-red-400 uppercase tracking-wide font-mono-tech">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>⚠️ ZERO ONLINE CARD PAYMENTS • DATA BREACH PROTECTION</span>
              </div>
              <p className="text-[11px] leading-relaxed text-red-200">
                To prevent major card data breaches and scams, <strong>NO payments can be processed on this website</strong>. All negotiations are strictly for <strong>Cash on Delivery</strong> or <strong>Venmo</strong> exchanged in person when you meet the seller and physically inspect the item.
              </p>
            </div>

            {/* Listing Summary Card */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#161618] border border-white/10">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-16 h-16 rounded-lg object-cover shrink-0 border border-white/10"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-oswald text-xs sm:text-sm font-bold text-white uppercase truncate">
                  {listing.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-mono-tech text-zinc-400">Listed:</span>
                  <span className="text-sm font-oswald font-bold text-[#e0f252]">
                    {formatOMR(originalPrice)}
                  </span>
                </div>
                <p className="text-[10px] font-mono-tech text-zinc-400 mt-0.5">
                  Seller: {listing.sellerName} • 📍 {listing.location}, {listing.city}
                </p>
                {listing.sellerPhone && (
                  <p className="text-[10px] font-mono-tech text-zinc-300">
                    Phone: <span className="text-white font-bold">{listing.sellerPhone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Quick Discount Presets */}
            <div>
              <label className="block text-xs font-mono-tech uppercase text-zinc-300 mb-2">
                Quick Discount Presets
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map((pct) => {
                  const targetPrice = calculatePriceFromDiscount(originalPrice, pct);
                  const isSelected = discountPercent === pct;
                  return (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleSelectPreset(pct)}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        isSelected
                          ? 'bg-[#e0f252] border-[#e0f252] text-[#111113] font-bold shadow-sm'
                          : 'bg-[#161618] border-white/10 hover:border-white/20 text-zinc-300'
                      }`}
                    >
                      <span className="block text-xs font-oswald uppercase tracking-wider">{pct}% OFF</span>
                      <span className={`block text-[10px] font-mono-tech mt-0.5 ${isSelected ? 'text-[#111113]' : 'text-zinc-400'}`}>
                        {formatOMR(targetPrice)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Offer Price Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono-tech uppercase text-zinc-300">
                  Your Proposed Offer (OMR)
                </label>
                {discountPercent > 0 && (
                  <span className="text-[11px] font-mono-tech font-bold text-[#e0f252] bg-[#e0f252]/10 px-2 py-0.5 rounded">
                    {discountPercent}% Discount ({formatOMR(originalPrice - offeredPrice)} saved)
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-mono-tech font-bold text-zinc-400">OMR</span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  max={originalPrice}
                  value={offeredPrice || ''}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="w-full pl-14 pr-4 py-2.5 bg-[#161618] border border-white/15 rounded-xl text-sm font-bold text-white outline-none focus:border-[#e0f252] focus:ring-1 focus:ring-[#e0f252] transition-all font-mono-tech"
                  placeholder="Enter your proposed price in OMR"
                  required
                />
              </div>
            </div>

            {/* Custom Note to Seller */}
            <div>
              <label className="block text-xs font-mono-tech uppercase text-zinc-300 mb-1.5">
                Message to Seller (Handover Location & Payment Terms)
              </label>
              <textarea
                rows={2}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Mention if you are ready for cash on pickup or Venmo handover..."
                className="w-full px-3.5 py-2 bg-[#161618] border border-white/15 rounded-xl text-xs text-white outline-none focus:border-[#e0f252] focus:ring-1 focus:ring-[#e0f252] transition-all resize-none"
              />
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit & Back Action Footer */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono-tech font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Listing</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isSellerSelf || offeredPrice <= 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#e0f252] hover:bg-[#cbdb40] disabled:opacity-50 text-[#111113] font-oswald uppercase tracking-wider text-xs font-bold shadow-md shadow-[#e0f252]/10 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Sending...' : 'Send Offer & Start Chat'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
