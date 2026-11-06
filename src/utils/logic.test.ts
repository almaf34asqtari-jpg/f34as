import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDiscountPercent,
  calculatePriceFromDiscount,
  isValidOfferPrice,
  isUserVerifiedPurchaser,
  calculateNewSellerRating,
  formatOMR,
  filterListings,
} from './logic';
import { Listing } from '../types/marketplace';

test('calculateDiscountPercent correctly calculates percentage', () => {
  assert.equal(calculateDiscountPercent(100, 80), 20);
  assert.equal(calculateDiscountPercent(250, 200), 20);
  assert.equal(calculateDiscountPercent(200, 200), 0);
  assert.equal(calculateDiscountPercent(200, 250), 0);
  assert.equal(calculateDiscountPercent(0, 10), 0);
});

test('calculatePriceFromDiscount computes price correctly', () => {
  assert.equal(calculatePriceFromDiscount(100, 15), 85);
  assert.equal(calculatePriceFromDiscount(200, 10), 180);
  assert.equal(calculatePriceFromDiscount(150, 0), 150);
});

test('isValidOfferPrice validates realistic offers and rejects abusive bids', () => {
  assert.deepEqual(isValidOfferPrice(100, 80), { valid: true });
  assert.equal(isValidOfferPrice(100, 100).valid, false);
  assert.equal(isValidOfferPrice(100, 120).valid, false);
  assert.equal(isValidOfferPrice(100, 5).valid, false); // below 20%
  assert.equal(isValidOfferPrice(100, -10).valid, false);
});

test('isUserVerifiedPurchaser prevents unverified reviews', () => {
  const verifiedListings = ['listing-ps5', 'listing-villa'];
  
  // User bought listing-ps5
  assert.equal(isUserVerifiedPurchaser(verifiedListings, 'listing-ps5', 'buyer-1', 'seller-2'), true);
  
  // User didn't buy listing-car
  assert.equal(isUserVerifiedPurchaser(verifiedListings, 'listing-car', 'buyer-1', 'seller-2'), false);
  
  // Seller cannot review self
  assert.equal(isUserVerifiedPurchaser(verifiedListings, 'listing-ps5', 'seller-2', 'seller-2'), false);
  
  // No buyer id
  assert.equal(isUserVerifiedPurchaser(verifiedListings, 'listing-ps5', '', 'seller-2'), false);
});

test('calculateNewSellerRating updates cumulative rating accurately', () => {
  // 4 reviews with 5.0 avg, adding a 4.0 review -> (20 + 4)/5 = 4.8
  const res = calculateNewSellerRating(5.0, 4, 4);
  assert.equal(res.averageRating, 4.8);
  assert.equal(res.totalReviews, 5);

  // 1 review with 4.0 avg, adding a 5.0 -> (4 + 5)/2 = 4.5
  const res2 = calculateNewSellerRating(4.0, 1, 5);
  assert.equal(res2.averageRating, 4.5);
  assert.equal(res2.totalReviews, 2);
});

test('formatOMR formats currency properly', () => {
  assert.equal(formatOMR(150), '150 OMR');
  assert.equal(formatOMR(12500), '12,500 OMR');
});

test('filterListings filters by category and search term correctly', () => {
  const sampleListings: Listing[] = [
    {
      id: '1',
      title: 'PlayStation 5 Slim 1TB',
      description: 'Brand new sealed PS5',
      category: 'gaming',
      price: 185,
      currency: 'OMR',
      isNegotiable: true,
      location: 'Al Seeb, Muscat',
      city: 'Muscat',
      images: ['/img1.jpg'],
      sellerId: 's1',
      sellerName: 'Salim',
      sellerPhone: '+968 9123 4567',
      sellerAvatar: '/avatar.jpg',
      sellerRating: 4.9,
      sellerReviewCount: 12,
      sellerVerified: true,
      status: 'active',
      views: 120,
      saves: 15,
      createdAt: '2026-03-01T10:00:00Z',
    },
    {
      id: '2',
      title: 'Luxury Villa with Sea View',
      description: 'Spacious 5 bedroom villa in Al Mouj',
      category: 'places',
      price: 320000,
      currency: 'OMR',
      isNegotiable: true,
      location: 'Al Mouj, Muscat',
      city: 'Muscat',
      images: ['/img2.jpg'],
      sellerId: 's2',
      sellerName: 'Fatima',
      sellerPhone: '+968 9876 5432',
      sellerAvatar: '/avatar2.jpg',
      sellerRating: 5.0,
      sellerReviewCount: 8,
      sellerVerified: true,
      status: 'active',
      views: 400,
      saves: 50,
      createdAt: '2026-03-02T10:00:00Z',
    },
  ];

  const gamingResults = filterListings(sampleListings, {
    category: 'gaming',
    searchQuery: '',
    city: 'all',
    sortBy: 'newest',
  });
  assert.equal(gamingResults.length, 1);
  assert.equal(gamingResults[0].id, '1');

  const searchResults = filterListings(sampleListings, {
    category: 'all',
    searchQuery: 'mouj',
    city: 'all',
    sortBy: 'newest',
  });
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].id, '2');
});
