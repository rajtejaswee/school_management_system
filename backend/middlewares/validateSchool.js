function validateSchoolInput(req, res, next) {
  const { name, address, latitude, longitude } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim() === '')
    errors.push('name is required and must be a non-empty string.');

  if (!address || typeof address !== 'string' || address.trim() === '')
    errors.push('address is required and must be a non-empty string.');

  if (latitude === undefined || isNaN(parseFloat(latitude)) || parseFloat(latitude) < -90 || parseFloat(latitude) > 90)
    errors.push('latitude must be a valid number between -90 and 90.');

  if (longitude === undefined || isNaN(parseFloat(longitude)) || parseFloat(longitude) < -180 || parseFloat(longitude) > 180)
    errors.push('longitude must be a valid number between -180 and 180.');

  if (errors.length > 0)
    return res.status(400).json({ success: false, errors });

  next();
}

module.exports = { validateSchoolInput };
