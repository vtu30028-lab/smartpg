export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'owner' | 'admin';
  phone?: string;
  avatar?: string;
  created_at?: string;
}

export interface PG {
  id: number;
  owner_id: number;
  name: string;
  description?: string;
  location: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rent: number;
  rooms: number;
  room_pricing: Record<string, number>;
  gender_preference: 'male' | 'female' | 'any';
  food_available: boolean;
  wifi: boolean;
  ac: boolean;
  attached_bathroom: boolean;
  laundry: boolean;
  parking: boolean;
  images: string[];
  amenities?: string[];
  rating: number;
  total_reviews: number;
  is_featured: boolean;
  is_active: boolean;
  distance?: number | null;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  reviews?: Review[];
}

export interface Review {
  id: number;
  user_id: number;
  pg_id: number;
  rating: number;
  comment?: string;
  user_name?: string;
  created_at: string;
}

export interface Booking {
  id: number;
  user_id: number;
  pg_id: number;
  room_type?: string;
  move_in_date?: string;
  duration_months: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_amount: number;
  pg_name?: string;
  location?: string;
  rent?: number;
  images?: string[];
  user_name?: string;
  user_email?: string;
  created_at: string;
}

export interface Payment {
  id: number;
  user_id: number;
  booking_id?: number;
  pg_id?: number;
  amount: number;
  payment_type: 'booking' | 'rent' | 'deposit';
  status: 'pending' | 'success' | 'failed';
  pg_name?: string;
  created_at: string;
}

export interface PGFilters {
  minRent?: number;
  maxRent?: number;
  food?: boolean;
  wifi?: boolean;
  ac?: boolean;
  bathroom?: boolean;
  roomType?: string;
  gender?: string;
  search?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  featured?: boolean;
}

export interface AISearchResult {
  summary: string;
  filters: Record<string, unknown>;
  results: PG[];
}
