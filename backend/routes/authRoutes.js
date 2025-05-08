const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Get all users 
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude passwords for security
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // console.log("User from DB:", user); // Debugging line

    res.status(200).json({
      message: "Login successful",
      token,
      // added wallet for user
      user: { id: user._id, name: user.name, email: user.email, wallet: user.wallet }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Signup route 
router.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        // add new attribute called wallet and store 100000, in the wallet during signup
        user = new User({ name, email, password: hashedPassword, wallet: 100000 }); // Set wallet to 100000

        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Get a single user
router.get("/user", async (req, res) => {
  try {
    const { email } = req.query; // Get email from query parameters

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email }, { password: 0 }); // Exclude password for security

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Google Signup Route
router.post("/google-signup", async (req, res) => {
  const { name, email, googleId } = req.body;

  if (!email || !googleId) {
    return res.status(400).json({ message: "Email and Google ID are required" });
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // First-time signup with Google
      user = new User({
        name,
        email,
        password: googleId, // Store Google ID as a dummy password (optional)
        wallet: 100000
      });

      await user.save();
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: "Google Signup successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, wallet: user.wallet }
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Google Login Route
router.post('/google-signin', async (req, res) => {
  const { name, email, googleId } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ name, email, password: '', googleId, wallet: 100000 });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful via Google',
      token,
      user: { id: user._id, name: user.name, email: user.email, wallet: user.wallet }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Need to signup with this account' });
  }
});

module.exports = router;