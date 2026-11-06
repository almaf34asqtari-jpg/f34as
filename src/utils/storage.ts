import {
  Listing,
  UserProfile,
  Review,
  ChatThread,
  ChatMessage,
  PaymentTransaction,
  PushNotification,
  NegotiationOffer,
} from '../types/marketplace';
import {
  SEED_LISTINGS,
  SEED_USERS,
  SEED_REVIEWS,
  SEED_CHATS,
  SEED_NOTIFICATIONS,
} from '../data/seedData';
import { calculateNewSellerRating } from './logic';

const KEYS = {
  LISTINGS: 'souq_oman_real_listings_v2',
  USERS: 'souq_oman_users_v2',
  CURRENT_USER_ID: 'souq_oman_current_user_id_v2',
  REVIEWS: 'souq_oman_reviews_v2',
  THREADS: 'souq_oman_threads_v2',
  MESSAGES: 'souq_oman_messages_v2',
  TRANSACTIONS: 'souq_oman_transactions_v2',
  NOTIFICATIONS: 'souq_oman_notifications_v2',
};

// Purge any legacy simulated/mock cache on load
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('souq_oman_listings_v1');
    localStorage.removeItem('souq_oman_reviews_v1');
    localStorage.removeItem('souq_oman_threads_v1');
    localStorage.removeItem('souq_oman_messages_v1');
    localStorage.removeItem('souq_oman_transactions_v1');
    localStorage.removeItem('souq_oman_notifications_v1');
  } catch {
    // Ignore in non-browser envs
  }
}

// --- Initializers ---

export function getStoredListings(): Listing[] {
  try {
    const data = localStorage.getItem(KEYS.LISTINGS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveListings(listings: Listing[]): void {
  localStorage.setItem(KEYS.LISTINGS, JSON.stringify(listings));
}

export function getStoredUsers(): UserProfile[] {
  try {
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : SEED_USERS;
  } catch {
    return SEED_USERS;
  }
}

export function saveUsers(users: UserProfile[]): void {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

export function getCurrentUser(): UserProfile {
  const users = getStoredUsers();
  try {
    const currentId = localStorage.getItem(KEYS.CURRENT_USER_ID);
    const found = users.find((u) => u.id === currentId);
    return found || users[0];
  } catch {
    return users[0];
  }
}

export function setCurrentUserId(userId: string): void {
  localStorage.setItem(KEYS.CURRENT_USER_ID, userId);
}

export function getStoredReviews(): Review[] {
  try {
    const data = localStorage.getItem(KEYS.REVIEWS);
    return data ? JSON.parse(data) : SEED_REVIEWS;
  } catch {
    return SEED_REVIEWS;
  }
}

export function saveReviews(reviews: Review[]): void {
  localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
}

export function getStoredThreads(): ChatThread[] {
  try {
    const data = localStorage.getItem(KEYS.THREADS);
    return data ? JSON.parse(data) : SEED_CHATS.map((c) => c.thread);
  } catch {
    return SEED_CHATS.map((c) => c.thread);
  }
}

export function saveThreads(threads: ChatThread[]): void {
  localStorage.setItem(KEYS.THREADS, JSON.stringify(threads));
}

export function getStoredMessages(): Record<string, ChatMessage[]> {
  try {
    const data = localStorage.getItem(KEYS.MESSAGES);
    if (data) return JSON.parse(data);
    const init: Record<string, ChatMessage[]> = {};
    SEED_CHATS.forEach((c) => {
      init[c.thread.id] = c.messages;
    });
    return init;
  } catch {
    const init: Record<string, ChatMessage[]> = {};
    SEED_CHATS.forEach((c) => {
      init[c.thread.id] = c.messages;
    });
    return init;
  }
}

export function saveMessages(messages: Record<string, ChatMessage[]>): void {
  localStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));
}

export function getStoredTransactions(): PaymentTransaction[] {
  try {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTransactions(transactions: PaymentTransaction[]): void {
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function getStoredNotifications(): PushNotification[] {
  try {
    const data = localStorage.getItem(KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : SEED_NOTIFICATIONS;
  } catch {
    return SEED_NOTIFICATIONS;
  }
}

export function saveNotifications(notifications: PushNotification[]): void {
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
}

// --- High Level Action Helpers ---

/**
 * Creates or retrieves a chat thread for a listing between buyer and seller,
 * sends a discount offer message, and dispatches a push notification to the seller.
 */
export function sendDiscountOffer({
  listing,
  buyer,
  offeredPrice,
  discountPercent,
  message,
}: {
  listing: Listing;
  buyer: UserProfile;
  offeredPrice: number;
  discountPercent: number;
  message: string;
}): { thread: ChatThread; offer: NegotiationOffer } {
  const threads = getStoredThreads();
  const messagesMap = getStoredMessages();
  const notifications = getStoredNotifications();

  // Find existing thread or create one
  let thread = threads.find(
    (t) => t.listingId === listing.id && t.buyerId === buyer.id && t.sellerId === listing.sellerId
  );

  const offer: NegotiationOffer = {
    id: `offer-${Date.now()}`,
    listingId: listing.id,
    listingTitle: listing.title,
    listingImage: listing.images[0] || '',
    sellerId: listing.sellerId,
    buyerId: buyer.id,
    buyerName: buyer.name,
    originalPrice: listing.price,
    offeredPrice,
    discountPercent,
    message,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!thread) {
    thread = {
      id: `thread-${listing.id}-${buyer.id}`,
      listingId: listing.id,
      listingTitle: listing.title,
      listingPrice: listing.price,
      listingImage: listing.images[0] || '',
      buyerId: buyer.id,
      buyerName: buyer.name,
      buyerAvatar: buyer.avatar,
      sellerId: listing.sellerId,
      sellerName: listing.sellerName,
      sellerAvatar: listing.sellerAvatar,
      lastMessage: `Discount request: ${offeredPrice} OMR (${discountPercent}% off)`,
      lastMessageTime: 'Just now',
      unreadCount: 1,
      activeNegotiation: offer,
    };
    threads.unshift(thread);
  } else {
    thread.lastMessage = `Discount request: ${offeredPrice} OMR (${discountPercent}% off)`;
    thread.lastMessageTime = 'Just now';
    thread.unreadCount += 1;
    thread.activeNegotiation = offer;
  }

  saveThreads(threads);

  // Add chat message
  const threadMessages = messagesMap[thread.id] || [];
  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    threadId: thread.id,
    senderId: buyer.id,
    senderName: buyer.name,
    text: message || `Salam, I would like to offer ${offeredPrice} OMR for this listing.`,
    createdAt: new Date().toISOString(),
    offerAttachment: offer,
  };
  threadMessages.push(newMsg);
  messagesMap[thread.id] = threadMessages;
  saveMessages(messagesMap);

  // Create push notification for the seller
  const newNotif: PushNotification = {
    id: `notif-${Date.now()}`,
    userId: listing.sellerId,
    title: `Discount Request on "${listing.title.slice(0, 30)}..."`,
    body: `${buyer.name} offered ${offeredPrice} OMR (${discountPercent}% discount). Click to reply or negotiate!`,
    type: 'discount_request',
    relatedListingId: listing.id,
    relatedThreadId: thread.id,
    read: false,
    createdAt: 'Just now',
  };
  notifications.unshift(newNotif);
  saveNotifications(notifications);

  return { thread, offer };
}

/**
 * Executes an escrow payment for a listing.
 */
export function executeEscrowPayment({
  listing,
  buyer,
  amount,
  paymentMethod,
  discountApplied,
}: {
  listing: Listing;
  buyer: UserProfile;
  amount: number;
  paymentMethod: 'thawani' | 'omannet' | 'card' | 'applepay' | 'cash_on_delivery' | 'venmo';
  discountApplied?: number;
}): { transaction: PaymentTransaction; updatedBuyer: UserProfile } {
  const transactions = getStoredTransactions();
  const users = getStoredUsers();
  const listings = getStoredListings();
  const notifications = getStoredNotifications();

  const transaction: PaymentTransaction = {
    id: `tx-${Date.now()}`,
    orderNumber: `OM-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    listingId: listing.id,
    listingTitle: listing.title,
    listingImage: listing.images[0] || '',
    sellerId: listing.sellerId,
    sellerName: listing.sellerName,
    buyerId: buyer.id,
    buyerName: buyer.name,
    amount,
    discountApplied,
    paymentMethod,
    escrowStatus: 'held_in_escrow',
    createdAt: new Date().toISOString(),
  };

  transactions.unshift(transaction);
  saveTransactions(transactions);

  // Update listing status to reserved or sold
  const updatedListings = listings.map((l) =>
    l.id === listing.id ? { ...l, status: 'reserved' as const } : l
  );
  saveListings(updatedListings);

  // Add listingId to buyer's verifiedPurchaserIds
  const buyerUserIndex = users.findIndex((u) => u.id === buyer.id);
  let updatedBuyer = buyer;
  if (buyerUserIndex !== -1) {
    const purchaserList = users[buyerUserIndex].verifiedPurchaserIds || [];
    if (!purchaserList.includes(listing.id)) {
      purchaserList.push(listing.id);
    }
    users[buyerUserIndex] = {
      ...users[buyerUserIndex],
      verifiedPurchaserIds: purchaserList,
    };
    saveUsers(users);
    updatedBuyer = users[buyerUserIndex];
  }

  // Push notification to seller
  notifications.unshift({
    id: `notif-${Date.now()}-seller`,
    userId: listing.sellerId,
    title: 'Payment Received in Escrow Guarantee!',
    body: `${buyer.name} paid ${amount} OMR. Safe funds are secured in escrow until handover.`,
    type: 'payment_escrow',
    relatedListingId: listing.id,
    read: false,
    createdAt: 'Just now',
  });

  // Push notification to buyer
  notifications.unshift({
    id: `notif-${Date.now()}-buyer`,
    userId: buyer.id,
    title: 'Escrow Transaction Successful! 🎉',
    body: `Payment of ${amount} OMR is secured. You can now leave a verified review for ${listing.sellerName}!`,
    type: 'payment_escrow',
    relatedListingId: listing.id,
    read: false,
    createdAt: 'Just now',
  });

  saveNotifications(notifications);

  return { transaction, updatedBuyer };
}

/**
 * Submits a verified buyer review.
 */
export function submitVerifiedReview({
  buyer,
  listing,
  rating,
  comment,
  criteriaTags,
}: {
  buyer: UserProfile;
  listing: Listing;
  rating: number;
  comment: string;
  criteriaTags: string[];
}): Review {
  const reviews = getStoredReviews();
  const users = getStoredUsers();
  const listings = getStoredListings();
  const notifications = getStoredNotifications();

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    sellerId: listing.sellerId,
    buyerId: buyer.id,
    buyerName: buyer.name,
    buyerAvatar: buyer.avatar,
    listingId: listing.id,
    listingTitle: listing.title,
    rating,
    comment,
    criteriaTags,
    createdAt: new Date().toISOString(),
    verifiedPurchase: true,
  };

  reviews.unshift(newReview);
  saveReviews(reviews);

  // Update seller rating
  const sellerIndex = users.findIndex((u) => u.id === listing.sellerId);
  if (sellerIndex !== -1) {
    const seller = users[sellerIndex];
    const { averageRating, totalReviews } = calculateNewSellerRating(
      seller.rating || 5.0,
      seller.reviewCount || 1,
      rating
    );
    users[sellerIndex] = {
      ...seller,
      rating: averageRating,
      reviewCount: totalReviews,
    };
    saveUsers(users);

    // Also update listing's cached seller rating
    const updatedListings = listings.map((l) =>
      l.sellerId === listing.sellerId
        ? { ...l, sellerRating: averageRating, sellerReviewCount: totalReviews }
        : l
    );
    saveListings(updatedListings);
  }

  // Notify seller of review
  notifications.unshift({
    id: `notif-${Date.now()}-rev`,
    userId: listing.sellerId,
    title: `New ${rating}-Star Verified Review! ⭐`,
    body: `${buyer.name} reviewed your transaction for "${listing.title.slice(0, 25)}..."`,
    type: 'review_received',
    relatedListingId: listing.id,
    read: false,
    createdAt: 'Just now',
  });
  saveNotifications(notifications);

  return newReview;
}
