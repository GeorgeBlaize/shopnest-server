function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, firebaseUid, ...safe } = user;
  return safe;
}

module.exports = sanitizeUser;
