const express = require('express');
const RecentlyVisited = require('../models/RecentlyVisited');
const router = express.Router();

// Fetch recently visited entries by userId
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch recent visits sorted by most recent
        const recentlyVisited = await RecentlyVisited.find({ user: userId }).sort({ visitedAt: -1 });

        if (recentlyVisited.length === 0) {
            return res.status(200).json({ message: 'No data in table', data: [] });
          }

        res.status(200).json(recentlyVisited);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add or update a recently visited entry (limit to 10 per user)
router.post('/add', async (req, res) => {
    try {
      const { user, symbol, companyName } = req.body;
  
      // Check if the symbol already exists for the user
      const existing = await RecentlyVisited.findOne({ user, symbol });
  
      if (existing) {
        // Just update the visitedAt timestamp
        existing.visitedAt = new Date();
        await existing.save();
        return res.status(200).json({ message: 'Visit time updated', data: existing });
      }
  
      // Count how many entries the user currently has
      const count = await RecentlyVisited.countDocuments({ user });
  
      if (count >= 10) {
        // Remove the oldest one
        await RecentlyVisited.findOneAndDelete({ user }, { sort: { visitedAt: 1 } });
      }
  
      // Add the new entry
      const newEntry = new RecentlyVisited({ user, symbol, companyName });
      await newEntry.save();
  
      return res.status(201).json({ message: 'Added to recently visited', data: newEntry });
    } catch (error) {
      console.error('Error adding recently visited:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  

// Remove an entry from recently visited
router.delete('/remove', async (req, res) => {
    try {
        const { user, symbol } = req.body;

        const deletedEntry = await RecentlyVisited.findOneAndDelete({ user, symbol });
        if (!deletedEntry) {
            return res.status(404).json({ message: 'Symbol not found in recently visited' });
        }

        res.status(200).json({ message: 'Removed from recently visited', data: deletedEntry });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Check if a stock is in recently visited
router.get('/check/:userId/:symbol', async (req, res) => {
    const { userId, symbol } = req.params;

    try {
        const exists = await RecentlyVisited.findOne({ user: userId, symbol });

        return res.json({ exists: !!exists });
    } catch (error) {
        console.error('Error checking recently visited:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
