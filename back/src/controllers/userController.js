const User = require("../models/User");

const getMyProfile = async (req, res) => {
  return res.status(200).json({
    message: "User fetched successfully",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
    },
  });
};

const updateMyProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name && !email && !password) {
      return res.status(400).json({
        message: "At least one field is required: name, email, or password",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(409).json({ message: "Email already in use" });
      }

      user.email = normalizedEmail;
    }

    if (typeof name !== "undefined") {
      user.name = name;
    }

    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          message: "Password must be at least 8 characters long",
        });
      }
      user.password = password;
    }

    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
};
