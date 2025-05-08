const express = require('express');
const Watchlist = require('../models/Watchlist');
const router = express.Router();

// Fetch watchlist details by specifying user id
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        // console.log(userId);
        // Fetch all watchlist entries for the user
        const watchlist = await Watchlist.find({ user: userId });

        res.status(200).json(watchlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add an entry to the watchlist
router.post('/add', async (req, res) => {
    try {
        const { user, symbol, companyName } = req.body;

        // Check if the entry already exists for the user
        const existingEntry = await Watchlist.findOne({ user, symbol });
        if (existingEntry) {
            return res.status(400).json({ message: 'Symbol already exists in the watchlist' });
        }

        const newEntry = new Watchlist({ user, symbol, companyName });
        await newEntry.save();
        res.status(201).json({ message: 'Added to watchlist', data: newEntry });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Remove an entry from the watchlist
router.delete('/remove', async (req, res) => {
    try {
        const { user, symbol } = req.body;

        const deletedEntry = await Watchlist.findOneAndDelete({ user, symbol });
        if (!deletedEntry) {
            return res.status(404).json({ message: 'Symbol not found in watchlist' });
        }

        res.status(200).json({ message: 'Removed from watchlist', data: deletedEntry });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// to check if stock exists in watchlist
router.get('/check/:userId/:symbol', async (req, res) => {
    const { userId, symbol } = req.params;

    try {
        const exists = await Watchlist.findOne({ user: userId, symbol });

        if (exists) {
            return res.json({ exists: true });
        } else {
            return res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking watchlist:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
