const jwt = require("jsonwebtoken");
const verifyToken = (token) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const decoded = jwt.verify(token, jwtSecret);
  return decoded;
};

module.exports = { verifyToken };
