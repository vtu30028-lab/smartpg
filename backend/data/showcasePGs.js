const showcasePGs = [
  {
    id: 1, owner_id: 2, name: 'Sunshine PG for Girls',
    description: 'Premium PG with homely food and 24/7 security near Christ University campus.',
    location: 'Koramangala, Bangalore', address: '123 5th Block, Koramangala',
    latitude: 12.9352, longitude: 77.6245, rent: 7500, rooms: 20, room_type: 'double',
    gender_preference: 'female', food_available: true, wifi: true, ac: true,
    attached_bathroom: true, laundry: true, parking: false,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
    rating: 4.5, total_reviews: 28, is_featured: true, is_active: true, owner_name: 'Rajesh Kumar',
  },
  {
    id: 2, owner_id: 2, name: 'Elite Boys Hostel',
    description: 'Modern hostel with gym, study room and high-speed WiFi near college area.',
    location: 'Indiranagar, Bangalore', address: '456 100 Feet Road, Indiranagar',
    latitude: 12.9784, longitude: 77.6408, rent: 6500, rooms: 30, room_type: 'triple',
    gender_preference: 'male', food_available: true, wifi: true, ac: false,
    attached_bathroom: false, laundry: true, parking: true,
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
    rating: 4.2, total_reviews: 45, is_featured: true, is_active: true, owner_name: 'Rajesh Kumar',
  },
  {
    id: 3, owner_id: 2, name: 'Comfort Stay PG',
    description: 'Budget friendly PG with WiFi near HSR metro station.',
    location: 'HSR Layout, Bangalore', address: '789 Sector 2, HSR Layout',
    latitude: 12.9116, longitude: 77.6473, rent: 5500, rooms: 15, room_type: 'shared',
    gender_preference: 'any', food_available: false, wifi: true, ac: false,
    attached_bathroom: false, laundry: false, parking: false,
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
    rating: 3.8, total_reviews: 12, is_featured: false, is_active: true, owner_name: 'Rajesh Kumar',
  },
  {
    id: 4, owner_id: 2, name: 'Premium Living Spaces',
    description: 'Luxury PG with AC rooms, attached bathroom and premium food near ITPL.',
    location: 'Whitefield, Bangalore', address: '321 ITPL Road, Whitefield',
    latitude: 12.9698, longitude: 77.7500, rent: 12000, rooms: 10, room_type: 'single',
    gender_preference: 'any', food_available: true, wifi: true, ac: true,
    attached_bathroom: true, laundry: true, parking: true,
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
    rating: 4.8, total_reviews: 56, is_featured: true, is_active: true, owner_name: 'Rajesh Kumar',
  },
  {
    id: 5, owner_id: 2, name: 'Student Hub PG',
    description: 'Perfect for college students with library, mess facility and study hall.',
    location: 'Jayanagar, Bangalore', address: '567 4th Block, Jayanagar',
    latitude: 12.9308, longitude: 77.5838, rent: 6000, rooms: 25, room_type: 'double',
    gender_preference: 'any', food_available: true, wifi: true, ac: false,
    attached_bathroom: true, laundry: true, parking: false,
    images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'],
    rating: 4.0, total_reviews: 33, is_featured: false, is_active: true, owner_name: 'Rajesh Kumar',
  },
  {
    id: 6, owner_id: 2, name: 'Green Valley Girls PG',
    description: 'Safe and clean PG for working women and students. Home-style food included.',
    location: 'BTM Layout, Bangalore', address: '12th Main, BTM 2nd Stage',
    latitude: 12.9166, longitude: 77.6101, rent: 7200, rooms: 18, room_type: 'double',
    gender_preference: 'female', food_available: true, wifi: true, ac: true,
    attached_bathroom: true, laundry: true, parking: false,
    images: ['https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
    rating: 4.6, total_reviews: 41, is_featured: true, is_active: true, owner_name: 'Rajesh Kumar',
  },
  {
    id: 7, owner_id: 2, name: 'Budget Nest PG',
    description: 'Affordable shared rooms under 5000 near college area.',
    location: 'Marathahalli, Bangalore', address: 'Outer Ring Road, Marathahalli',
    latitude: 12.9591, longitude: 77.6974, rent: 4500, rooms: 40, room_type: 'shared',
    gender_preference: 'any', food_available: false, wifi: true, ac: false,
    attached_bathroom: false, laundry: false, parking: true,
    images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800'],
    rating: 3.5, total_reviews: 8, is_featured: false, is_active: true, owner_name: 'Rajesh Kumar',
  },
  {
    id: 8, owner_id: 3, name: 'Campus Connect PG',
    description: 'Right next to RV College. Mess with North & South Indian food. WiFi 100 Mbps.',
    location: 'Jayanagar, Bangalore', address: 'RV College Road, Jayanagar',
    latitude: 12.9230, longitude: 77.5680, rent: 7800, rooms: 22, room_type: 'triple',
    gender_preference: 'any', food_available: true, wifi: true, ac: false,
    attached_bathroom: true, laundry: true, parking: false,
    images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'],
    rating: 4.4, total_reviews: 37, is_featured: true, is_active: true, owner_name: 'Anita Desai',
  },
  {
    id: 9, owner_id: 3, name: 'Silicon Stay PG',
    description: 'Tech park friendly PG near Bellandur. AC rooms, food, laundry & parking.',
    location: 'Bellandur, Bangalore', address: 'ORR Bellandur Gate',
    latitude: 12.9250, longitude: 77.6762, rent: 9500, rooms: 16, room_type: 'double',
    gender_preference: 'any', food_available: true, wifi: true, ac: true,
    attached_bathroom: true, laundry: true, parking: true,
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=958&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
    rating: 4.7, total_reviews: 52, is_featured: true, is_active: true, owner_name: 'Anita Desai',
  },
  {
    id: 10, owner_id: 3, name: 'Scholar\'s Den PG',
    description: 'Quiet PG for exam prep. Study room, WiFi, food under 8000 near college area.',
    location: 'Rajajinagar, Bangalore', address: 'Near Rajajinagar Metro',
    latitude: 13.0104, longitude: 77.5514, rent: 6800, rooms: 14, room_type: 'double',
    gender_preference: 'any', food_available: true, wifi: true, ac: false,
    attached_bathroom: true, laundry: true, parking: false,
    images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'],
    rating: 4.0, total_reviews: 21, is_featured: false, is_active: true, owner_name: 'Anita Desai',
  },
  {
    id: 11, owner_id: 3, name: 'Pocket Friendly PG',
    description: 'Best value PG in HSR — under 6000 with WiFi. Perfect for first-year students.',
    location: 'HSR Layout, Bangalore', address: 'Sector 7, HSR Layout',
    latitude: 12.9080, longitude: 77.6510, rent: 4800, rooms: 30, room_type: 'shared',
    gender_preference: 'any', food_available: false, wifi: true, ac: false,
    attached_bathroom: false, laundry: false, parking: false,
    images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800'],
    rating: 3.9, total_reviews: 11, is_featured: false, is_active: true, owner_name: 'Anita Desai',
  },
  {
    id: 12, owner_id: 3, name: 'Skyline Premium PG',
    description: 'Top-floor rooms with city view. AC, attached bath, premium food — all inclusive.',
    location: 'Indiranagar, Bangalore', address: 'CMH Road, Indiranagar',
    latitude: 12.9719, longitude: 77.6412, rent: 11000, rooms: 8, room_type: 'single',
    gender_preference: 'any', food_available: true, wifi: true, ac: true,
    attached_bathroom: true, laundry: true, parking: true,
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
    rating: 4.9, total_reviews: 63, is_featured: true, is_active: true, owner_name: 'Anita Desai',
  },
];

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function filterShowcasePGs(query) {
  let results = [...showcasePGs];
  const {
    minRent, maxRent, food, wifi, ac, bathroom,
    roomType, gender, search, lat, lng, radius = 10,
    featured, ownerId,
  } = query;

  if (minRent) results = results.filter((p) => p.rent >= Number(minRent));
  if (maxRent) results = results.filter((p) => p.rent <= Number(maxRent));
  if (food === 'true') results = results.filter((p) => p.food_available);
  if (wifi === 'true') results = results.filter((p) => p.wifi);
  if (ac === 'true') results = results.filter((p) => p.ac);
  if (bathroom === 'true') results = results.filter((p) => p.attached_bathroom);
  if (roomType) results = results.filter((p) => p.room_type === roomType);
  if (gender) results = results.filter((p) => p.gender_preference === gender || p.gender_preference === 'any');
  if (search) {
    const term = search.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.location.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
    );
  }
  if (featured === 'true') results = results.filter((p) => p.is_featured);
  if (ownerId) results = results.filter((p) => p.owner_id === Number(ownerId));

  if (lat && lng) {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = parseFloat(radius);
    results = results
      .map((pg) => ({
        ...pg,
        distance: Math.round(haversineDistance(userLat, userLng, pg.latitude, pg.longitude) * 10) / 10,
      }))
      .filter((pg) => pg.distance <= maxRadius)
      .sort((a, b) => a.distance - b.distance);
  }

  return results.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || b.rating - a.rating);
}

function getShowcasePGById(id) {
  const pg = showcasePGs.find((p) => p.id === Number(id));
  if (!pg) return null;
  return {
    ...pg,
    owner_phone: '9876543210',
    owner_email: 'owner@smartpg.com',
    reviews: [
      { id: 1, user_id: 4, pg_id: pg.id, rating: 5, comment: 'Great place, highly recommended!', user_name: 'Priya Sharma', created_at: '2026-01-15' },
    ],
  };
}

module.exports = { showcasePGs, filterShowcasePGs, getShowcasePGById, haversineDistance };
