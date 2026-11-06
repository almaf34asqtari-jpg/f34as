import React from 'react';
import {
  MapPin,
  Tag,
  Star,
  Eye,
  Heart,
  MessageCircle,
  ShieldCheck,
  Percent,
  Trash2,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { Listing, UserProfile } from '../types/marketplace';
import { formatOMR, calculateDiscountPercent } from '../utils/logic';

interface ListingCardProps {
  listing: Listing;
  currentUser?: UserProfile | null;
  onSelect: (listing: Listing) => void;
  onRequestDiscount: (listing: Listing) => void;
  onDeleteListing?: (listingId: string) => void;
  isSaved?: boolean;
  onToggleSave?: (listingId: string) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  currentUser,
  onSelect,
  onRequestDiscount,
  onDeleteListing,
  isSaved = false,
  onToggleSave,
}) => {
  const isOwner = currentUser && listing.sellerId === currentUser.id;
  const isAdmin = currentUser?.role === 'admin';
  const canDelete = isOwner || isAdmin;

  const discount = listing.originalPrice
    ? calculateDiscountPercent(listing.originalPrice, listing.price)
    : 0;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to permanently delete "${listing.title}"? This cannot be undone.`)) {
      onDeleteListing?.(listing.id);
    }
  };

  return (
    <article
      onClick={() => onSelect(listing)}
      className="group bg-[#1e1e20] text-zinc-100 rounded-xl border border-white/10 overflow-hidden shadow-md hover:border-[#e0f252] transition-all duration-200 flex flex-col cursor-pointer relative"
    >
      {/* Thumbnail & Badges */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-[#161618]">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter grayscale-[25%] group-hover:grayscale-0"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isOwner && (
              <span className="bg-[#e0f252] text-[#111113] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-xs font-mono-tech flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Your Ad
              </span>
            )}
            <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-mono-tech px-2 py-0.5 rounded flex items-center gap-1 border border-white/10">
              <MapPin className="w-3 h-3 text-[#e0f252]" />
              {listing.city}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* SELLER & ADMIN DELETE BUTTON (BUYERS CANNOT SEE THIS) */}
            {canDelete && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="pointer-events-auto p-1.5 rounded-full bg-red-600/90 hover:bg-red-700 text-white shadow-md transition-all active:scale-90"
                title={isOwner ? 'Delete Your Post' : 'Admin Delete Post'}
                aria-label={`Delete listing ${listing.title}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Favorite button */}
            {onToggleSave && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(listing.id);
                }}
                className={`pointer-events-auto p-1.5 rounded-full backdrop-blur-md transition-all ${
                  isSaved
                    ? 'bg-rose-500 text-white'
                    : 'bg-black/40 hover:bg-black/70 text-white'
                }`}
                aria-label={isSaved ? 'Remove from saved' : 'Save ad'}
              >
                <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Bottom image tags */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-xs pointer-events-none">
          {listing.isNegotiable && (
            <span className="bg-[#e0f252]/90 backdrop-blur-xs text-[#111113] text-[9px] font-bold font-mono-tech uppercase px-2 py-0.5 rounded flex items-center gap-1">
              <Percent className="w-2.5 h-2.5" />
              Cash / Venmo Negotiable
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Specific Specs Pills */}
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            {listing.category === 'gaming' && listing.gamingSpecs && (
              <span className="text-[9px] font-mono-tech bg-white/5 text-zinc-300 border border-white/10 px-1.5 py-0.5 rounded">
                🎮 {listing.gamingSpecs.consoleModel} • {listing.gamingSpecs.storage}
              </span>
            )}
            {listing.category === 'places' && listing.propertySpecs && (
              <span className="text-[9px] font-mono-tech bg-white/5 text-zinc-300 border border-white/10 px-1.5 py-0.5 rounded">
                🏡 {listing.propertySpecs.bedrooms} Beds • {listing.propertySpecs.areaSqM} m²
              </span>
            )}
            {listing.category === 'cars' && listing.carSpecs && (
              <span className="text-[9px] font-mono-tech bg-white/5 text-zinc-300 border border-white/10 px-1.5 py-0.5 rounded">
                🚗 {listing.carSpecs.year} • {listing.carSpecs.mileageKm.toLocaleString()} km
              </span>
            )}
          </div>

          {/* Title in Oswald */}
          <h3 className="font-oswald text-sm text-white uppercase group-hover:text-[#e0f252] transition-colors line-clamp-2 leading-snug">
            {listing.title}
          </h3>

          {/* Location & Neighborhood */}
          <p className="text-[11px] font-mono-tech text-zinc-400 mt-1 flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-[#e0f252] shrink-0" />
            <span>{listing.location}</span>
          </p>

          {/* Visible Seller Phone */}
          <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono-tech text-zinc-300 bg-[#161618] px-2 py-1 rounded border border-white/5">
            <span className="text-zinc-400 text-[10px]">Seller:</span>
            <a
              href={`tel:${listing.sellerPhone}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[#e0f252] hover:underline font-bold flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              <span>{listing.sellerPhone || '+968 9xxx xxxx'}</span>
            </a>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="mt-3 pt-2.5 border-t border-white/10">
          <div className="flex items-baseline justify-between mb-2.5">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-oswald text-xl font-bold text-[#e0f252]">
                  {formatOMR(listing.price)}
                </span>
                {listing.originalPrice && listing.originalPrice > listing.price && (
                  <span className="font-mono-tech text-xs text-zinc-500 line-through">
                    {formatOMR(listing.originalPrice)}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <span className="text-[9px] font-mono-tech text-[#e0f252] font-semibold">
                  Valuation: -{discount}%
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono-tech text-zinc-400">
                Handover: <strong className="text-white">Cash / Venmo</strong>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {isOwner ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(listing);
                }}
                className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-xs font-oswald uppercase tracking-wider font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors"
                aria-label={`View your listing ${listing.title}`}
              >
                <Eye className="w-3.5 h-3.5 text-[#e0f252]" />
                <span>Your Ad</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestDiscount(listing);
                }}
                className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-xs font-oswald uppercase tracking-wider font-bold bg-[#e0f252]/10 hover:bg-[#e0f252]/20 text-[#e0f252] border border-[#e0f252]/30 transition-colors"
                aria-label={`Request discount for ${listing.title}`}
              >
                <Tag className="w-3.5 h-3.5 text-[#e0f252]" />
                <span>Ask Discount</span>
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(listing);
              }}
              className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-xs font-oswald uppercase tracking-wider font-bold bg-white text-[#111113] hover:bg-zinc-200 transition-colors"
              aria-label={`View details for ${listing.title}`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>View & Chat</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
