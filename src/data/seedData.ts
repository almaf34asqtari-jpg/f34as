import { Listing, UserProfile, Review, ChatThread, ChatMessage, PushNotification } from '../types/marketplace';

export const SEED_USERS: UserProfile[] = [
  {
    id: 'user-feras',
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
    joinedDate: 'January 2024',
  },
  {
    id: 'user-tariq',
    name: 'Tariq Al-Balushi',
    email: 'tariq.muscat@souqoman.com',
    phone: '+968 9512 8841',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    city: 'Muscat',
    verifiedId: true,
    verifiedPurchaserIds: [],
    rating: 5.0,
    reviewCount: 0,
    joinedDate: 'January 2024',
  },
  {
    id: 'user-salim',
    name: 'Salim Al-Harthy',
    email: 'salim.alharthy@souqoman.com',
    phone: '+968 9988 2314',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    city: 'Seeb',
    verifiedId: true,
    verifiedPurchaserIds: [],
    rating: 5.0,
    reviewCount: 0,
    joinedDate: 'March 2023',
  },
  {
    id: 'user-fatima',
    name: 'Fatima Al-Riyami',
    email: 'fatima.realestate@souqoman.com',
    phone: '+968 9234 5678',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    city: 'Muscat',
    verifiedId: true,
    verifiedPurchaserIds: [],
    rating: 5.0,
    reviewCount: 0,
    joinedDate: 'November 2022',
  },
];

// No AI-generated or fake dummy listings. Only real user/customer uploaded posts appear.
export const SEED_LISTINGS: Listing[] = [];

// No fake generated reviews.
export const SEED_REVIEWS: Review[] = [];

// No fake chat threads.
export const SEED_CHATS: { thread: ChatThread; messages: ChatMessage[] }[] = [];

// Clean notifications.
export const SEED_NOTIFICATIONS: PushNotification[] = [];
