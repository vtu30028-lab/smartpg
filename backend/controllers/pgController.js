const db = require('../config/database');
const { filterShowcasePGs, getShowcasePGById, showcasePGs } = require('../data/showcasePGs');

const parseJsonField = (field) => {
  if (!field) return field;
  if (typeof field === 'string') {
    try { return JSON.parse(field); } catch { return field; }
  }
  return field;
};

const formatPG = (pg) => ({
  ...pg,
  room_pricing: parseJsonField(pg.room_pricing) || {},
  images: parseJsonField(pg.images) || [],
  amenities: parseJsonField(pg.amenities) || [],
  food_available: Boolean(pg.food_available),
  wifi: Boolean(pg.wifi),
  ac: Boolean(pg.ac),
  attached_bathroom: Boolean(pg.attached_bathroom),
  laundry: Boolean(pg.laundry),
  parking: Boolean(pg.parking),
  is_featured: Boolean(pg.is_featured),
  is_active: Boolean(pg.is_active),
});

exports.getAllPGs = async (req, res) => {
  try {
    const {
      minRent, maxRent, food, wifi, ac, bathroom,
      roomType, gender, search, lat, lng, radius = 10,
      featured, ownerId,
    } = req.query;

    let query = `
      SELECT p.*, u.name as owner_name, u.phone as owner_phone
      FROM pgs p
      JOIN users u ON p.owner_id = u.id
      WHERE p.is_active = TRUE
    `;
    const params = [];

    if (minRent) { query += ' AND p.rent >= ?'; params.push(minRent); }
    if (maxRent) { query += ' AND p.rent <= ?'; params.push(maxRent); }
    if (food === 'true') { query += ' AND p.food_available = TRUE'; }
    if (wifi === 'true') { query += ' AND p.wifi = TRUE'; }
    if (ac === 'true') { query += ' AND p.ac = TRUE'; }
    if (bathroom === 'true') { query += ' AND p.attached_bathroom = TRUE'; }
    if (roomType) { query += ' AND p.room_pricing->>? IS NOT NULL'; params.push(roomType); }
    if (gender) { query += ' AND (p.gender_preference = ? OR p.gender_preference = \'any\')'; params.push(gender); }
    if (search) {
      query += ` AND (
        p.name ILIKE ? OR p.name ILIKE ? OR 
        p.location ILIKE ? OR p.location ILIKE ?
      )`;
      const startsWith = `${search}%`;
      const wordInside = `% ${search}%`;
      params.push(startsWith, wordInside, startsWith, wordInside);
    }
    if (featured === 'true') { query += ' AND p.is_featured = TRUE'; }
    if (ownerId) { query += ' AND p.owner_id = ?'; params.push(ownerId); }

    query += ' ORDER BY p.is_featured DESC, p.rating DESC';

    const [pgs] = await db.query(query, params);
    let results = pgs.map(formatPG);

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = parseFloat(radius);

      results = results.map((pg) => {
        if (pg.latitude && pg.longitude) {
          const distance = haversineDistance(userLat, userLng, parseFloat(pg.latitude), parseFloat(pg.longitude));
          return { ...pg, distance: Math.round(distance * 10) / 10 };
        }
        return { ...pg, distance: null };
      }).filter((pg) => pg.distance === null || pg.distance <= maxRadius)
        .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
    }

    res.json(results);
  } catch (error) {
    console.error('Get PGs error (using showcase data):', error.message);
    const results = filterShowcasePGs(req.query);
    res.json(results);
  }
};

exports.getPGById = async (req, res) => {
  try {
    const [pgs] = await db.query(
      `SELECT p.*, u.name as owner_name, u.phone as owner_phone, u.email as owner_email
       FROM pgs p JOIN users u ON p.owner_id = u.id WHERE p.id = ?`,
      [req.params.id]
    );

    if (pgs.length === 0) {
      return res.status(404).json({ message: 'PG not found.' });
    }

    const [reviews] = await db.query(
      `SELECT r.*, u.name as user_name FROM reviews r
       JOIN users u ON r.user_id = u.id WHERE r.pg_id = ? ORDER BY r.created_at DESC`,
      [req.params.id]
    );

    res.json({ ...formatPG(pgs[0]), reviews });
  } catch (error) {
    console.error('Get PG error (using showcase data):', error.message);
    const pg = getShowcasePGById(req.params.id);
    if (!pg) return res.status(404).json({ message: 'PG not found.' });
    res.json(pg);
  }
};

exports.createPG = async (req, res) => {
  const {
    name, description, location, address, latitude, longitude,
    rooms, room_pricing, gender_preference,
    food_available, wifi, ac, attached_bathroom, laundry, parking,
    images, amenities,
  } = req.body;

  if (!name || !location || !room_pricing) {
    return res.status(400).json({ message: 'Name, location and room pricing are required.' });
  }

  const prices = Object.values(room_pricing).map(Number).filter(n => !isNaN(n));
  const rent = prices.length > 0 ? Math.min(...prices) : 0;

  try {
    const [result] = await db.query(
      `INSERT INTO pgs (owner_id, name, description, location, address, latitude, longitude,
        rent, rooms, room_pricing, gender_preference, food_available, wifi, ac,
        attached_bathroom, laundry, parking, images, amenities)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, name, description, location, address,
        latitude || null, longitude || null,
        rent, rooms || 1, JSON.stringify(room_pricing || {}), gender_preference || 'any',
        food_available || false, wifi || false, ac || false,
        attached_bathroom || false, laundry || false, parking || false,
        JSON.stringify(images || []), JSON.stringify(amenities || []),
      ]
    );

    res.status(201).json({ message: 'PG created successfully.', id: result.insertId });
  } catch (error) {
    console.error('Create PG error (demo mode) Details:', error);
    const newId = Math.max(...showcasePGs.map((p) => p.id), 0) + 1;
    showcasePGs.unshift({
      id: newId,
      owner_id: req.user.id,
      name,
      description,
      location,
      address,
      latitude: latitude || null,
      longitude: longitude || null,
      rent: Number(rent),
      rooms: rooms || 1,
      room_pricing: room_pricing || {},
      gender_preference: gender_preference || 'any',
      food_available: !!food_available,
      wifi: !!wifi,
      ac: !!ac,
      attached_bathroom: !!attached_bathroom,
      laundry: !!laundry,
      parking: !!parking,
      images: images || [],
      rating: 0,
      total_reviews: 0,
      is_featured: false,
      is_active: true,
      owner_name: req.user.name,
    });
    res.status(201).json({ message: 'PG created successfully.', id: newId });
  }
};

exports.updatePG = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await db.query('SELECT owner_id FROM pgs WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ message: 'PG not found.' });
    }
    if (existing[0].owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this PG.' });
    }

    const fields = [
      'name', 'description', 'location', 'address', 'latitude', 'longitude',
      'rooms', 'room_pricing', 'gender_preference',
      'food_available', 'wifi', 'ac', 'attached_bathroom', 'laundry', 'parking',
      'images', 'amenities', 'is_featured', 'is_active',
    ];

    const updates = [];
    const values = [];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        const val = ['images', 'amenities', 'room_pricing'].includes(field)
          ? JSON.stringify(req.body[field])
          : req.body[field];
        values.push(val);
      }
    }

    if (req.body.room_pricing !== undefined) {
      const prices = Object.values(req.body.room_pricing).map(Number).filter(n => !isNaN(n));
      const rent = prices.length > 0 ? Math.min(...prices) : 0;
      updates.push(`rent = ?`);
      values.push(rent);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update.' });
    }

    values.push(id);
    await db.query(`UPDATE pgs SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ message: 'PG updated successfully.' });
  } catch (error) {
    console.error('Update PG error (demo mode):', error.message);
    const pg = showcasePGs.find((p) => p.id === Number(id));
    if (!pg) return res.status(404).json({ message: 'PG not found.' });
    if (pg.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this PG.' });
    }
    Object.assign(pg, req.body);
    res.json({ message: 'PG updated successfully.' });
  }
};

exports.deletePG = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await db.query('SELECT owner_id FROM pgs WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ message: 'PG not found.' });
    }
    if (existing[0].owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this PG.' });
    }

    await db.query('DELETE FROM pgs WHERE id = ?', [id]);
    res.json({ message: 'PG deleted successfully.' });
  } catch (error) {
    console.error('Delete PG error (demo mode):', error.message);
    const idx = showcasePGs.findIndex((p) => p.id === Number(id));
    if (idx === -1) return res.status(404).json({ message: 'PG not found.' });
    if (showcasePGs[idx].owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this PG.' });
    }
    showcasePGs.splice(idx, 1);
    res.json({ message: 'PG deleted successfully.' });
  }
};

exports.addReview = async (req, res) => {
  const { pg_id, rating, comment } = req.body;

  if (!pg_id || !rating) {
    return res.status(400).json({ message: 'PG ID and rating are required.' });
  }

  try {
    await db.query(
      'INSERT INTO reviews (user_id, pg_id, rating, comment) VALUES (?, ?, ?, ?) ON CONFLICT (user_id, pg_id) DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment',
      [req.user.id, pg_id, rating, comment]
    );

    const [stats] = await db.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM reviews WHERE pg_id = ?',
      [pg_id]
    );

    await db.query(
      'UPDATE pgs SET rating = ?, total_reviews = ? WHERE id = ?',
      [parseFloat(stats[0].avg_rating).toFixed(2), stats[0].total, pg_id]
    );

    res.status(201).json({ message: 'Review submitted successfully.' });
  } catch (error) {
    console.error('Review error (demo mode):', error.message);
    const pg = showcasePGs.find((p) => p.id === Number(pg_id));
    if (pg) {
      pg.total_reviews += 1;
      pg.rating = parseFloat(((pg.rating * (pg.total_reviews - 1) + Number(rating)) / pg.total_reviews).toFixed(2));
    }
    res.status(201).json({ message: 'Review submitted successfully.' });
  }
};

exports.aiSearch = async (req, res) => {
  try {
    const { query, lat, lng } = req.body;
    if (!query) {
      return res.status(400).json({ message: 'Query is required.' });
    }

    const filters = parseAIQuery(query);
    
    if (filters.isGreeting) {
      return res.json({
        summary: "Hello! I'm your AI PG Assistant. Tell me what you're looking for, e.g., 'Find a boys PG under 8000 in Koramangala with food'.",
        filters: {},
        results: []
      });
    }

    let sql = `
      SELECT p.*, u.name as owner_name FROM pgs p
      JOIN users u ON p.owner_id = u.id WHERE p.is_active = TRUE
    `;
    const params = [];

    if (filters.maxRent) { sql += ' AND p.rent <= ?'; params.push(filters.maxRent); }
    if (filters.minRent) { sql += ' AND p.rent >= ?'; params.push(filters.minRent); }
    if (filters.food) { sql += ' AND p.food_available = TRUE'; }
    if (filters.wifi) { sql += ' AND p.wifi = TRUE'; }
    if (filters.ac) { sql += ' AND p.ac = TRUE'; }
    if (filters.bathroom) { sql += ' AND p.attached_bathroom = TRUE'; }
    if (filters.gender) { sql += ' AND (p.gender_preference = ? OR p.gender_preference = \'any\')'; params.push(filters.gender); }
    if (filters.roomType) { sql += ' AND p.room_pricing->>? IS NOT NULL'; params.push(filters.roomType); }
    if (filters.location) {
      sql += ' AND (p.location ILIKE ? OR p.address ILIKE ?)';
      params.push(`%${filters.location}%`, `%${filters.location}%`);
    }

    sql += ' ORDER BY p.rating DESC LIMIT 10';
    const [pgs] = await db.query(sql, params);
    let results = pgs.map(formatPG);

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      results = results.map((pg) => {
        if (pg.latitude && pg.longitude) {
          const distance = haversineDistance(userLat, userLng, parseFloat(pg.latitude), parseFloat(pg.longitude));
          return { ...pg, distance: Math.round(distance * 10) / 10 };
        }
        return pg;
      }).sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
    }

    const summary = generateAISummary(query, filters, results);

    res.json({ summary, filters, results });
  } catch (error) {
    console.error('AI search error (using showcase data):', error.message);
    const filters = parseAIQuery(req.body.query);
    
    if (filters.isGreeting) {
      return res.json({
        summary: "Hello! I'm your AI PG Assistant. Tell me what you're looking for, e.g., 'Find a boys PG under 8000 in Koramangala with food'.",
        filters: {},
        results: []
      });
    }

    const queryParams = { ...filters };
    if (filters.maxRent) queryParams.maxRent = filters.maxRent;
    if (filters.minRent) queryParams.minRent = filters.minRent;
    if (filters.food) queryParams.food = 'true';
    if (filters.wifi) queryParams.wifi = 'true';
    if (filters.ac) queryParams.ac = 'true';
    if (filters.bathroom) queryParams.bathroom = 'true';
    if (filters.gender) queryParams.gender = filters.gender;
    if (filters.roomType) queryParams.roomType = filters.roomType;
    if (filters.location) queryParams.search = filters.location;
    if (req.body.lat) queryParams.lat = req.body.lat;
    if (req.body.lng) queryParams.lng = req.body.lng;
    const results = filterShowcasePGs(queryParams).slice(0, 10);
    const summary = generateAISummary(req.body.query, filters, results);
    res.json({ summary, filters, results });
  }
};

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseAIQuery(query) {
  const q = query.toLowerCase();
  const filters = {};

  if (/^(hi|hello|hey|help|who are you|what can you do)[\s\W]*$/.test(q)) {
    filters.isGreeting = true;
    return filters;
  }

  const rentMatch = q.match(/under\s*(?:rs\.?\s*)?(\d+)|below\s*(\d+)|max\s*(\d+)|budget\s*(\d+)/);
  if (rentMatch) {
    filters.maxRent = parseInt(rentMatch[1] || rentMatch[2] || rentMatch[3] || rentMatch[4]);
  }

  const minRentMatch = q.match(/above\s*(\d+)|min(?:imum)?\s*(\d+)/);
  if (minRentMatch) {
    filters.minRent = parseInt(minRentMatch[1] || minRentMatch[2]);
  }

  if (q.includes('food') || q.includes('mess')) filters.food = true;
  if (q.includes('wifi') || q.includes('wi-fi') || q.includes('internet')) filters.wifi = true;
  if (q.includes(' ac ') || q.includes('air condition') || q.endsWith(' ac')) filters.ac = true;
  if (q.includes('bathroom') || q.includes('attached bath')) filters.bathroom = true;

  if (q.includes('girl') || q.includes('female') || q.includes('ladies')) filters.gender = 'female';
  if (q.includes('boy') || q.includes('male') || q.includes('gents')) filters.gender = 'male';

  if (q.includes('single')) filters.roomType = 'single';
  if (q.includes('double')) filters.roomType = 'double';
  if (q.includes('triple')) filters.roomType = 'triple';
  if (q.includes('shared')) filters.roomType = 'shared';

  const locations = ['koramangala', 'indiranagar', 'hsr', 'whitefield', 'jayanagar', 'bangalore', 'college'];
  for (const loc of locations) {
    if (q.includes(loc)) {
      filters.location = loc;
      break;
    }
  }

  return filters;
}

function generateAISummary(query, filters, results) {
  const parts = [`Based on your query: "${query}"`];

  const applied = [];
  if (filters.maxRent) applied.push(`budget under ₹${filters.maxRent}`);
  if (filters.food) applied.push('food available');
  if (filters.wifi) applied.push('WiFi');
  if (filters.ac) applied.push('AC');
  if (filters.gender) applied.push(`${filters.gender} only`);
  if (filters.location) applied.push(`near ${filters.location}`);

  if (applied.length > 0) {
    parts.push(`I filtered for: ${applied.join(', ')}.`);
  } else {
    parts.push(`I searched all nearby PGs for you. (Tip: Try adding specifics like 'under 8000' or 'with food'!)`);
  }

  if (results.length === 0) {
    parts.push('No matching PGs found. Try adjusting your filters.');
  } else {
    parts.push(`Found ${results.length} matching PG${results.length > 1 ? 's' : ''}.`);
    const top = results[0];
    parts.push(`Top pick: **${top.name}** at ₹${top.rent}/month${top.distance != null ? ` (${top.distance} km away)` : ''}.`);
  }

  return parts.join(' ');
}
