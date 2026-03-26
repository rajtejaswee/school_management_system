const pool = require('../config/db');
const { haversineDistance } = require('../utils/distance');

async function addSchool(req, res) {
  try {
    const { name, address, latitude, longitude } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name.trim(), address.trim(), parseFloat(latitude), parseFloat(longitude)]
    );

    return res.status(201).json({
      success: true,
      message: 'School added successfully.',
      schoolId: result.insertId,
    });
  } catch (err) {
    console.error('addSchool error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

async function listSchools(req, res) {
  try {
    const userLat  = parseFloat(req.query.latitude);
    const userLon  = parseFloat(req.query.longitude);

    if (isNaN(userLat) || isNaN(userLon) || userLat < -90 || userLat > 90 || userLon < -180 || userLon > 180) {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude (-90 to 90) and longitude (-180 to 180) query parameters are required.',
      });
    }

    const [schools] = await pool.execute('SELECT * FROM schools');

    const sorted = schools
      .map((school) => ({
        ...school,
        distance_km: parseFloat(
          haversineDistance(userLat, userLon, school.latitude, school.longitude).toFixed(2)
        ),
      }))
      .sort((a, b) => a.distance_km - b.distance_km);

    return res.status(200).json({
      success: true,
      count: sorted.length,
      userLocation: { latitude: userLat, longitude: userLon },
      schools: sorted,
    });
  } catch (err) {
    console.error('listSchools error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

module.exports = { addSchool, listSchools };
