const asyncHandler = require("express-async-handler");
const UserStudyPad = require("../models/User.js");
const { verifyAccessToken } = require("../utils/jwt.js");

// Protect routes - verify JWT access token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = verifyAccessToken(token);

      // Get user from token (exclude password)
      req.user = await UserStudyPad.findById(decoded.id).select(
        "-password -refreshToken"
      );

      if (!req.user) {
        res.status(401);
        throw new Error("User not found");
      }

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };
