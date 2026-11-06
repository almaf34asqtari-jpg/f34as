import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Banknote,
  Phone,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Listing, UserProfile, PaymentTransaction } from '../types/marketplace';
import { formatOMR } from '../utils/logic';
import { executeEscrowPayment } from '../utils/storage';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
  currentUser: UserProfile | null;
  agreedPrice?: number;
  discountApplied?: number;
  onPaymentSuccess: (transaction: PaymentTransaction, updatedBuyer: UserProfile) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  listing,
  currentUser,
  agreedPrice,
  discountApplied,
  onPaymentSuccess,
}) => {
  const [preferredMethod, setPreferredMethod] = useState<'cash' | 'venmo'>('cash');
  const [step, setStep] = useState<'details' | 'success'>('details');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTx, setCompletedTx] = useState<PaymentTransaction | null>(null);

  if (!isOpen || !listing || !currentUser) return null;

  const finalAmount = agreedPrice !== undefined ? agreedPrice : listing.price;

  const handleConfirmHandoverAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const { transaction, updatedBuyer } = executeEscrowPayment({
          listing,
          buyer: currentUser,
          amount: finalAmount,
          paymentMethod: preferredMethod === 'cash' ? 'cash_on_delivery' : 'venmo',
          discountApplied,
        });

        setCompletedTx(transaction);
        setIsProcessing(false);
        setStep('success');
        onPaymentSuccess(transaction, updatedBuyer);
      } catch (err) {
        setIsProcessing(false);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e1e20] text-zinc-100 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-white/15 animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#161618]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#e0f252] text-[#111113] flex items-center justify-center font-bold">
              <Banknote className="w-5 h-5 text-[#111113]" />
            </div>
            <div>
              <h2 className="text-base font-oswald uppercase tracking-wider font-bold text-white">
                Cash / Venmo In-Person Handover
              </h2>
              <p className="text-[11px] font-mono-tech text-zinc-400">
                Direct Handover Agreement • Zero Website Card Payments
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Handover Confirmation */}
        {step === 'details' && (
          <form onSubmit={handleConfirmHandoverAgreement} className="p-5 sm:p-6 space-y-4 font-mono-tech">
            {/* PROMINENT RED DATA BREACH WARNING */}
            <div className="p-3.5 rounded-xl bg-red-950/40 border-2 border-red-500 text-red-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-red-400 uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Zero Card Processing • 100% Anti-Breach Policy</span>
              </div>
              <p className="text-[11px] leading-relaxed text-red-200">
                To guarantee zero financial leaks and prevent data breaches, <strong>we do not accept or store card numbers on this website</strong>. All transactions are settled directly via <strong>Cash on Handover</strong> or <strong>Venmo</strong> in person in Oman.
              </p>
            </div>

            {/* Agreed Terms Card */}
            <div className="p-4 rounded-xl bg-[#161618] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span className="truncate max-w-[220px] font-bold text-white">{listing.title}</span>
                <span>{formatOMR(listing.price)}</span>
              </div>
              {discountApplied && discountApplied > 0 && (
                <div className="flex items-center justify-between text-xs text-[#e0f252] font-bold">
                  <span>Negotiated Price Discount:</span>
                  <span>-{formatOMR(discountApplied)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-zinc-400">Agreed Handover Amount:</span>
                <span className="text-xl font-oswald font-bold text-[#e0f252]">
                  {formatOMR(finalAmount)}
                </span>
              </div>
            </div>

            {/* Seller Contact & Meeting Spot */}
            <div className="p-3.5 rounded-xl bg-[#161618] border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Seller:</span>
                <span className="text-white font-bold">{listing.sellerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Phone:</span>
                <a href={`tel:${listing.sellerPhone}`} className="text-[#e0f252] font-bold flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{listing.sellerPhone}</span>
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Handover Location:</span>
                <span className="text-zinc-200 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#e0f252]" />
                  <span>{listing.location}, {listing.city}</span>
                </span>
              </div>
            </div>

            {/* Settlement Selection */}
            <div>
              <label className="block text-xs uppercase font-bold text-zinc-300 mb-2">
                Select Your Payment Settlement Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPreferredMethod('cash')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    preferredMethod === 'cash'
                      ? 'border-[#e0f252] bg-[#e0f252]/10 text-white'
                      : 'border-white/10 bg-[#161618] text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase font-oswald">Cash on Delivery</span>
                    <div className={`w-3 h-3 rounded-full border ${preferredMethod === 'cash' ? 'border-[#e0f252] bg-[#e0f252]' : 'border-zinc-600'}`} />
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-0.5 block">Cash handover upon inspection</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreferredMethod('venmo')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    preferredMethod === 'venmo'
                      ? 'border-[#e0f252] bg-[#e0f252]/10 text-white'
                      : 'border-white/10 bg-[#161618] text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase font-oswald">Venmo App</span>
                    <div className={`w-3 h-3 rounded-full border ${preferredMethod === 'venmo' ? 'border-[#e0f252] bg-[#e0f252]' : 'border-zinc-600'}`} />
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-0.5 block">Transfer on inspection</span>
                </button>
              </div>
            </div>

            {/* In-Person Handover Checklist */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[11px] text-zinc-300 space-y-1">
              <p className="font-bold text-white">Safe Handover Checklist:</p>
              <p>1. Meet in a well-lit, public location in {listing.city}.</p>
              <p>2. Physically inspect the item/vehicle/contract thoroughly.</p>
              <p>3. Pay via {preferredMethod === 'cash' ? 'Cash' : 'Venmo'} only once you are 100% satisfied.</p>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 bg-[#e0f252] hover:bg-[#cbdb40] text-[#111113] font-oswald uppercase tracking-wider font-bold text-xs rounded-lg shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>{isProcessing ? 'Confirming Deal Terms...' : `Confirm Handover & Unlock Verified Review (${formatOMR(finalAmount)})`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: Confirmed & Verified Purchaser Unlock */}
        {step === 'success' && completedTx && (
          <div className="p-6 space-y-5 text-center font-mono-tech">
            <div className="w-16 h-16 rounded-full bg-[#e0f252]/20 border-2 border-[#e0f252] text-[#e0f252] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="font-oswald text-xl uppercase font-bold text-white">
                Handover Agreement Confirmed!
              </h3>
              <p className="text-xs text-zinc-300 mt-1 max-w-sm mx-auto">
                Deal terms confirmed for {formatOMR(completedTx.amount)} via {preferredMethod === 'cash' ? 'Cash' : 'Venmo'}. Please meet seller {completedTx.sellerName} for physical inspection.
              </p>
            </div>

            {/* Official Confirmation Card */}
            <div className="p-4 rounded-xl bg-[#161618] border border-white/10 text-left text-xs space-y-2">
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>Deal Agreement Ref:</span>
                <span className="font-bold text-white">{completedTx.orderNumber}</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>Item:</span>
                <span className="font-bold text-white truncate max-w-[200px]">{completedTx.listingTitle}</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>Settlement:</span>
                <span className="font-bold text-[#e0f252] uppercase">{preferredMethod === 'cash' ? 'Cash on Delivery' : 'Venmo Handover'}</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-white">
                <span>Agreed Price:</span>
                <span className="text-[#e0f252] font-oswald text-base">{formatOMR(completedTx.amount)}</span>
              </div>
            </div>

            {/* Verified Purchaser Unlock Prompt */}
            <div className="p-3.5 rounded-xl bg-[#e0f252]/10 border border-[#e0f252]/30 text-left flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#e0f252] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white uppercase font-oswald">
                  Verified Purchaser Status Granted!
                </p>
                <p className="text-[11px] text-zinc-300 mt-0.5">
                  You are now verified to write an authentic review and rate seller {completedTx.sellerName}.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-[#e0f252] hover:bg-[#cbdb40] text-[#111113] font-oswald uppercase tracking-wider font-bold text-xs rounded-lg shadow-md transition-colors"
            >
              Done & Return to Marketplace
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

