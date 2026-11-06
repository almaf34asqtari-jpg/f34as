export type CategoryId = 'places' | 'cars' | 'gaming' | 'electronics' | 'furniture';

export interface PropertySpecs {
  propertyType: 'Villa' | 'Apartment' | 'Duplex' | 'Chalet' | 'Commercial' | 'Land';
  bedrooms: number;
  bathrooms: number;
  areaSqM: number;
  listingType: 'For Sale' | 'For Rent';
  rentFrequency?: 'Monthly' | 'Yearly';
  furnished: boolean;
  amenities: string[];
}

export interface CarSpecs {
  make: string;
  model: string;
  year: number;
  mileageKm: number;
  transmission: 'Automatic' | 'Manual';
  specsOrigin: 'GCC Specs' | 'North American' | 'European' | 'Japanese';
  fuelType: 'Petrol' | 'Hybrid' | 'Electric' | 'Diesel';
  bodyType: 'SUV' | 'Sedan' | 'Coupe' | 'Truck';
  condition: 'Brand New' | 'Excellent (Single Owner)' | 'Good' | 'Fair';
}

export interface GamingSpecs {
  consoleModel: 'PlayStation 5 Pro' | 'PlayStation 5 Slim' | 'PlayStation 5 Standard' | 'PlayStation 4 Pro' | 'PlayStation 4 Slim' | 'Nintendo Switch OLED' | 'Xbox Series X' | 'Gaming PC Rig' | 'Games & Accessories';
  storage: '512GB' | '1TB' | '2TB' | 'Custom SSD' | 'N/A';
  condition: 'Brand New (Sealed)' | 'Like New (Open Box)' | 'Used - Mint Condition' | 'Well Used';
  includedGames: string[];
  includedAccessories: string[];
  warrantyMonths?: number;
}

export interface GeneralSpecs {
  brand?: string;
  condition?: string;
  warranty?: string;
  color?: string;
}

export interface Listing {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  category: CategoryId;
  price: number; // In OMR
  originalPrice?: number;
  currency: 'OMR';
  isNegotiable: boolean;
  location: string;
  city: 'Muscat' | 'Salalah' | 'Sohar' | 'Nizwa' | 'Seeb' | 'Bawshar' | 'Sur' | 'Al Buraimi';
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerAvatar: string;
  sellerRating: number;
  sellerReviewCount: number;
  sellerVerified: boolean;
  status: 'active' | 'sold' | 'reserved' | 'under_review' | 'flagged';
  featured?: boolean;
  views: number;
  saves: number;
  createdAt: string;
  propertySpecs?: PropertySpecs;
  carSpecs?: CarSpecs;
  gamingSpecs?: GamingSpecs;
  generalSpecs?: GeneralSpecs;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'user' | 'admin' | 'buyer' | 'seller';
  avatar: string;
  city: string;
  verifiedId: boolean;
  verifiedPurchaserIds: string[]; // List of listingIds this user has purchased via Escrow
  rating: number;
  reviewCount: number;
  joinedDate: string;
}

export interface NegotiationOffer {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  originalPrice: number;
  offeredPrice: number;
  discountPercent: number;
  message: string;
  status: 'pending' | 'accepted' | 'countered' | 'declined' | 'paid';
  counterPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  offerAttachment?: NegotiationOffer;
  isSystem?: boolean;
}

export interface ChatThread {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingImage: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  activeNegotiation?: NegotiationOffer;
}

export interface Review {
  id: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  listingId: string;
  listingTitle: string;
  rating: number; // 1-5
  comment: string;
  criteriaTags: string[];
  createdAt: string;
  verifiedPurchase: true; // Verified purchaser only
}

export interface PaymentTransaction {
  id: string;
  orderNumber: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  amount: number;
  discountApplied?: number;
  paymentMethod: 'thawani' | 'omannet' | 'card' | 'applepay' | 'cash_on_delivery' | 'venmo';
  escrowStatus: 'held_in_escrow' | 'released_to_seller' | 'disputed';
  createdAt: string;
}

export interface PushNotification {
  id: string;
  userId?: string;
  title: string;
  body?: string;
  message?: string;
  type: 'discount_request' | 'offer_accepted' | 'offer_declined' | 'offer_countered' | 'chat_message' | 'payment_escrow' | 'review_received' | 'admin_alert' | 'system';
  relatedListingId?: string;
  relatedThreadId?: string;
  read: boolean;
  createdAt?: string;
  timestamp?: string;
}

