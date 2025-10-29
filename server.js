const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const passport = require("./mern-ecommerce/middleware/passport");
const session = require("express-session");
const app = express();
// notepad routes
const dataRoute = require("./hpnotepad/routes/dataRoute");
// mern-commerce routes
const authRoutes = require("./mern-ecommerce/routes/authRoutes");
const collectionRoutes = require("./mern-ecommerce/routes/collectionRoutes");
const productRoutes = require("./mern-ecommerce/routes/productRoutes");
const reviewRoutes = require("./mern-ecommerce/routes/reviewRoutes");
const cartRoutes = require("./mern-ecommerce/routes/cartRoutes");
const orderRoutes = require("./mern-ecommerce/routes/orderRoutes");
const userRoutes = require("./mern-ecommerce/routes/userRoutes");
// nodemailer
const nodemailerRoute = require("./utils/nodemailer");
// keepalive
const keepaliveRoute = require("./utils/keepalive");

// Connect DB
(async () => {
  mongoose.set("strictQuery", false);
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(process.env.MONGO_URI);
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
})();

// expression session
app.use(
  session({
    secret: "privateKey",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production", // Only secure in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Important for OAuth
      httpOnly: true,
    },
  })
);

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});

// passport for mern-ecommerce
app.use(passport.initialize());
app.use(passport.session());

// console.log(typeof process.env.RAPID_API_KEY)
app.use("/", express.static(path.resolve(path.join(__dirname, "./build"))));

app.use(express.json());

const whitelist = [
  "http://localhost:3000",
  "http://localhost:5000",
  "https://accounts.google.com",
  "https://github.com",
  "https://e-commerce-mern-eryu.onrender.com",
  "https://e-commerce-mern-api.onrender.com",
  "https://hpnotepad.onrender.com",
  "https://fantasticfy.onrender.com",
  "https://patrickobrien.onrender.com",
  "https://node-server-4m2h.onrender.com",
];
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Origin: ", origin);
      // Allow requests with no origin (like Postman, mobile apps, server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));

// keepalive route
app.use("/keepalive", keepaliveRoute);

// nodemailer route
app.use("/nodemailer", nodemailerRoute);

// hpnotepad routes
app.use("/hpnotepad/data", dataRoute);

// mern-ecommerce routes
app.use("/mern-ecommerce/auth", authRoutes);
app.use("/mern-ecommerce/user", userRoutes);
app.use("/mern-ecommerce/collection", collectionRoutes);
app.use("/mern-ecommerce/product", productRoutes);
app.use("/mern-ecommerce/reviews", reviewRoutes);
app.use("/mern-ecommerce/cart", cartRoutes);
app.use("/mern-ecommerce/orders", orderRoutes);

const port = process.env.PORT || 5000;

app.listen(port, console.log(`server listing to port 5000 only`));
