const UserModel = require("../models/userModel.js");
const generateUserTokens = require("../middleware/generateToken.js");
const jwt = require("jsonwebtoken");

const signin = async (req, res) => {
  const { email, password, cart } = req.body;

  try {
    const foundUser = await UserModel.findOne({ email });

    if (!foundUser)
      return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordCorrect = await foundUser.isPasswordMatch(password);

    if (!isPasswordCorrect)
      return res.status(401).json({ message: "Invalid credentials" });

    if (cart && cart.length > 0) {
      foundUser.cart = cart;
      await foundUser.save();
    }

    const { accessToken, refreshToken } = generateUserTokens(foundUser);

    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    res.status(200).json({ foundUser, accessToken, refreshToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const signup = async (req, res) => {
  const { email, password, confirmPassword, username, cart } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const foundUser = await UserModel.findOne({ email });

    if (foundUser)
      return res.status(400).json({ message: "User already exists" });

    const newUser = await UserModel.create({
      email,
      password: password,
      username,
      cart,
    });

    const { accessToken, refreshToken } = generateUserTokens(newUser);

    newUser.refreshToken = refreshToken;
    await newUser.save();

    res.status(201).json({ newUser, accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });

    console.log(error);
  }
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).send({ error: "Refresh token required" });
  }

  try {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(403).send({ error: "Invalid refresh token" });
        }

        const foundUser = await UserModel.findById(decoded.id);
        if (!foundUser) {
          return res.status(403).send({ error: "User not found" });
        }

        const { accessToken, refreshToken } = generateUserTokens(foundUser);

        foundUser.refreshToken = refreshToken;
        await foundUser.save();

        return res
          .status(200)
          .send({ foundUser, accessToken: accessToken, refreshToken: refreshToken });
      }
    );
  } catch (error) {
    console.log(error)
  }
};


module.exports = { signin, signup, refresh };
