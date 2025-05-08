const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Update name
router.put("/name", async (req, res) => {
  const { email, name } = req.body;

  try {
    if (!email || !name) {
      return res.status(400).json({ message: "Email and new name are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.name === name) {
      return res.status(400).json({ message: "Name must be different from the current one" });
    }

    user.name = name;
    await user.save();

    res.json({ message: "Name updated successfully" });
  } catch (error) {
    console.error("Error updating name:", error);
    res.status(500).json({ message: "Error updating name", error });
  }
});

// Update Email
router.put("/email", async (req, res) => {
  const { email, newEmail } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if new email is different
    if (user.email === newEmail) {
      return res.status(400).json({ message: "Email must be different from the current one" });
    }

    // Check if new email is already in use
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return res.status(400).json({ message: "Email is already taken. Choose a different one." });
    }

    user.email = newEmail;
    await user.save();
    res.json({ message: "Email updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating email", error });
  }
});

// Update Password
router.put("/password", async (req, res) => {
  const { email, password } = req.body;  // Ensure request contains email & password

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if new password is the same as old password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      return res.status(400).json({ message: "Password must be different from the current one" });
    }

    // Hash the new password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Error updating password", error });
  }
});


// Update Wallet
router.put("/wallet", async (req, res) => {
    const { email, wallet } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // Ensure the value is valid
      if (wallet <= 0) {
        return res.status(400).json({ message: "Amount must be greater than zero" });
      }
  
      // Add the amount instead of replacing it
      user.wallet += wallet;
      await user.save();
  
      res.json({ message: "Wallet updated successfully", wallet: user.wallet });
    } catch (error) {
      console.error("Error updating wallet:", error);
      res.status(500).json({ message: "Error updating wallet", error });
    }
  });
  
// Update Wallet
router.put("/tradewallet", async (req, res) => {
  const { email, wallet } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Add the amount instead of replacing it
    user.wallet += wallet;
    await user.save();

    res.json({ message: "Wallet updated successfully", wallet: user.wallet });
  } catch (error) {
    console.error("Error updating wallet:", error);
    res.status(500).json({ message: "Error updating wallet", error });
  }
});

module.exports = router;