const express = require("express");
const asyncHandler = require("express-async-handler");
const UserStudyPad = require("../models/User.js");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please provide all required fields");
    }

    // Check if user exists
    const userExists = await UserStudyPad.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists with this email");
    }

    // Create user
    const user = await UserStudyPad.create({
      name,
      email,
      password,
    });

    if (user) {
      // Generate tokens
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token to user
      user.refreshToken = refreshToken;
      await user.save();

      res.status(201).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        accessToken,
        refreshToken,
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  })
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400);
      throw new Error("Please provide email and password");
    }

    // Find user (include password for comparison)
    const user = await UserStudyPad.findOne({ email }).select("+password");

    if (user && (await user.comparePassword(password))) {
      // Generate tokens
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token
      user.refreshToken = refreshToken;
      await user.save();

      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        accessToken,
        refreshToken,
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  })
);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401);
      throw new Error("Refresh token is required");
    }

    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Find user and verify refresh token matches
      const user = await UserStudyPad.findById(decoded.id).select(
        "+refreshToken"
      );

      if (!user || user.refreshToken !== refreshToken) {
        res.status(401);
        throw new Error("Invalid refresh token");
      }

      // Generate new access token
      const accessToken = generateAccessToken(user._id);

      res.json({
        accessToken,
      });
    } catch (error) {
      res.status(401);
      throw new Error("Invalid or expired refresh token");
    }
  })
);

// @route   GET /api/auth/verify
// @desc    Verify access token and return user
// @access  Private
router.get(
  "/verify",
  protect,
  asyncHandler(async (req, res) => {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
    });
  })
);

// @route   POST /api/auth/logout
// @desc    Logout user (clear refresh token)
// @access  Private
router.post(
  "/logout",
  protect,
  asyncHandler(async (req, res) => {
    // Clear refresh token from database
    const user = await UserStudyPad.findById(req.user._id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.json({ message: "Logged out successfully" });
  })
);

module.exports = router;
