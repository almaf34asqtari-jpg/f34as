import { Listing, CategoryId } from '../types/marketplace';

export interface FilterState {
  searchQuery: string;
  category: CategoryId | 'all';
  city: string; // 'all' or specific city
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  sortBy: 'newest' | 'price_low' | 'price_high' | 'popular';
}

/**
 * Calculates discount percentage rounded to whole number or 1 decimal place.
 */
export function calculateDiscountPercent(originalPrice: number, offeredPrice: number): number {
  if (originalPrice <= 0 || offeredPrice >= originalPrice) return 0;
  const pct = ((originalPrice - offeredPrice) / originalPrice) * 100;
  return Math.round(pct * 10) / 10;
}

/**
 * Computes the discounted price given original price and percentage.
 */
export function calculatePriceFromDiscount(originalPrice: number, discountPercent: number): number {
  if (discountPercent <= 0) return originalPrice;
  if (discountPercent >= 100) return 0;
  const discounted = originalPrice * (1 - discountPercent / 100);
  return Math.round(discounted * 100) / 100;
}

/**
 * Validates a buyer's proposed offer price.
 */
export function isValidOfferPrice(originalPrice: number, offeredPrice: number): { valid: boolean; error?: string } {
  if (isNaN(offeredPrice) || offeredPrice <= 0) {
    return { valid: false, error: 'Please enter a valid offer amount in OMR' };
  }
  if (offeredPrice >= originalPrice) {
    return { valid: false, error: 'Offer must be lower than the original listing price' };
  }
  if (offeredPrice < originalPrice * 0.2) {
    return { valid: false, error: 'Offers below 20% of listing price are not permitted' };
  }
  return { valid: true };
}

/**
 * Checks whether a user has verified purchaser rights to review a seller or specific listing.
 * A customer must have completed an Escrow purchase of the listing or an item from this seller.
 */
export function isUserVerifiedPurchaser(
  verifiedListingIds: string[],
  listingId: string,
  buyerId?: string,
  sellerId?: string
): boolean {
  if (!buyerId || !listingId) return false;
  // Seller cannot review themselves
  if (buyerId === sellerId) return false;
  return verifiedListingIds.includes(listingId);
}

/**
 * Updates seller average rating incrementally when a new review is submitted.
 */
export function calculateNewSellerRating(
  currentRating: number,
  currentReviewCount: number,
  newRating: number
): { averageRating: number; totalReviews: number } {
  if (newRating < 1 || newRating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  const totalReviews = currentReviewCount + 1;
  const totalScore = (currentRating * currentReviewCount) + newRating;
  const averageRating = Math.round((totalScore / totalReviews) * 10) / 10;
  return { averageRating, totalReviews };
}

/**
 * Formats Omani Rial currency with OMR symbol.
 */
export function formatOMR(amount: number): string {
  if (isNaN(amount)) return '0 OMR';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount) + ' OMR';
}

/**
 * Filters and sorts listings based on query, category, price range, city, etc.
 */
export function filterListings(listings: Listing[], filters: FilterState): Listing[] {
  return listings
    .filter((item) => {
      // Category filter
      if (filters.category !== 'all' && item.category !== filters.category) {
        return false;
      }

      // City filter
      if (filters.city !== 'all' && item.city.toLowerCase() !== filters.city.toLowerCase()) {
        return false;
      }

      // Price filter
      if (filters.minPrice !== undefined && item.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== undefined && item.price > filters.maxPrice) {
        return false;
      }

      // Search query filter (matches title, description, category, car model, property type, gaming model)
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(query);
        const inDesc = item.description.toLowerCase().includes(query);
        const inLocation = item.location.toLowerCase().includes(query);
        const inCar = item.carSpecs ? `${item.carSpecs.make} ${item.carSpecs.model}`.toLowerCase().includes(query) : false;
        const inGame = item.gamingSpecs ? `${item.gamingSpecs.consoleModel} ${item.gamingSpecs.includedGames.join(' ')}`.toLowerCase().includes(query) : false;
        const inProperty = item.propertySpecs ? `${item.propertySpecs.propertyType} ${item.propertySpecs.listingType}`.toLowerCase().includes(query) : false;

        if (!inTitle && !inDesc && !inLocation && !inCar && !inGame && !inProperty) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (filters.sortBy === 'price_low') {
        return a.price - b.price;
      }
      if (filters.sortBy === 'price_high') {
        return b.price - a.price;
      }
      if (filters.sortBy === 'popular') {
        return (b.views + b.saves * 3) - (a.views + a.saves * 3);
      }
      return 0;
    });
}
