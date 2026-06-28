import type { PG } from '../types';

export const fallbackPGs: PG[] = [
  {
    id: 1, owner_id: 2, name: 'Sunshine PG for Girls',
    description: 'Premium PG with homely food and 24/7 security near college campus.',
    location: 'Koramangala, Bangalore', rent: 7500, rooms: 20, room_pricing: { double: 7500 },
    gender_preference: 'female', food_available: true, wifi: true, ac: true,
    attached_bathroom: true, laundry: true, parking: false,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
    rating: 4.5, total_reviews: 28, is_featured: true, is_active: true,
  },
  {
    id: 4, owner_id: 2, name: 'Premium Living Spaces',
    description: 'Luxury PG with AC rooms, attached bathroom and premium food.',
    location: 'Whitefield, Bangalore', rent: 12000, rooms: 10, room_pricing: { single: 12000 },
    gender_preference: 'any', food_available: true, wifi: true, ac: true,
    attached_bathroom: true, laundry: true, parking: true,
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
    rating: 4.8, total_reviews: 56, is_featured: true, is_active: true,
  },
  {
    id: 8, owner_id: 3, name: 'Campus Connect PG',
    description: 'Right next to RV College. Mess with North & South Indian food.',
    location: 'Jayanagar, Bangalore', rent: 7800, rooms: 22, room_pricing: { triple: 7800 },
    gender_preference: 'any', food_available: true, wifi: true, ac: false,
    attached_bathroom: true, laundry: true, parking: false,
    images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'],
    rating: 4.4, total_reviews: 37, is_featured: true, is_active: true,
  },
  {
    id: 9, owner_id: 3, name: 'Silicon Stay PG',
    description: 'Tech park friendly PG near Bellandur. AC rooms, food, laundry & parking.',
    location: 'Bellandur, Bangalore', rent: 9500, rooms: 16, room_pricing: { double: 9500 },
    gender_preference: 'any', food_available: true, wifi: true, ac: true,
    attached_bathroom: true, laundry: true, parking: true,
    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe5?w=800'],
    rating: 4.7, total_reviews: 52, is_featured: true, is_active: true,
  },
];

export const getFeaturedPGs = () => fallbackPGs.filter((p) => p.is_featured);
export const getAllFallbackPGs = () => fallbackPGs;
