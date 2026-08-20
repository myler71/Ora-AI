const User = require("../models/User");
const { verifyToken } = require("../util/verifyToken");

const readTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;
  return token;
};

const protect = async (req, res, next) => {
  try {
    const token = readTokenFromHeader(req);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = verifyToken(token);
    const user = await User.findOne({ _id: decoded.userId, isDeleted: false });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const optionalProtect = async (req, res, next) => {
  try {
    const token = readTokenFromHeader(req);
    if (!token) {
      return next();
    }
    const decoded = verifyToken(token);
    const user = await User.findOne({ _id: decoded.userId, isDeleted: false });
    if (!user) {
      return next();
    }
    req.user = user;
    return next();
  } catch (_error) {
    return next();
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!roles.includes(req.user.role || "dentist")) {
      return res.status(403).json({ message: "Access forbidden: insufficient role permissions" });
    }
    return next();
  };
};

module.exports = { protect, optionalProtect, requireRole };
