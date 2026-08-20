const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signAccessToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ userId }, jwtSecret, { expiresIn: "7d" });
};

const signResetToken = (userId, email) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ userId, email, purpose: "password-reset" }, jwtSecret, {
    expiresIn: "10m",
  });
};

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      isDeleted: false,
    });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const user = await User.create({ name, email, password });
    const accessToken = signAccessToken(user._id.toString());

    return res.status(201).json({
      message: "Sign up successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      isDeleted: false,
    }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = signAccessToken(user._id.toString());
    return res.status(200).json({
      message: "Sign in successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      isDeleted: false,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = crypto.randomInt(100000, 1000000).toString(); // 6 digit otp
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otpCode = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    return res.status(200).json({
      message: "OTP generated successfully",
      otp, // Replace with real email delivery in production.
      expiresAt: otpExpiresAt,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and otp are required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      isDeleted: false,
    });
    if (!user || !user.otpCode || !user.otpExpiresAt) {
      return res.status(400).json({ message: "No valid OTP request found" });
    }

    const isOtpExpired = user.otpExpiresAt.getTime() < Date.now();
    if (isOtpExpired) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const resetToken = signResetToken(user._id.toString(), user.email);

    return res.status(200).json({
      message: "OTP verified",
      resetToken,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res
        .status(400)
        .json({ message: "resetToken and newPassword are required" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: "JWT_SECRET is not configured" });
    }

    let payload;
    try {
      payload = jwt.verify(resetToken, jwtSecret);
    } catch (_error) {
      return res
        .status(401)
        .json({ message: "Invalid or expired reset token" });
    }

    if (payload.purpose !== "password-reset") {
      return res.status(401).json({ message: "Invalid reset token purpose" });
    }

    const user = await User.findOne({
      _id: payload.userId,
      isDeleted: false,
    }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword;
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  signup,
  signin,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
