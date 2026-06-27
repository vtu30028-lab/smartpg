const db = require('../config/database');

const PG = {
  findAll: (conditions = '', params = []) =>
    db.query(`SELECT p.*, u.name as owner_name FROM pgs p JOIN users u ON p.owner_id = u.id WHERE p.is_active = TRUE ${conditions}`, params),
  findById: (id) =>
    db.query('SELECT p.*, u.name as owner_name, u.phone as owner_phone FROM pgs p JOIN users u ON p.owner_id = u.id WHERE p.id = ?', [id]),
  create: (data) => db.query(
    `INSERT INTO pgs (owner_id, name, description, location, address, latitude, longitude, rent, rooms, room_type, gender_preference, food_available, wifi, ac, attached_bathroom, laundry, parking, images)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    Object.values(data)
  ),
  update: (id, fields) => db.query(`UPDATE pgs SET ? WHERE id = ?`, [fields, id]),
  delete: (id) => db.query('DELETE FROM pgs WHERE id = ?', [id]),
};

module.exports = PG;
