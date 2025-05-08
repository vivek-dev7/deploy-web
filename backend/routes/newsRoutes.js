// routes/newsRoutes.js
const express = require('express');
const router = express.Router();
const { execFile } = require('child_process');

// Route to call Python script and fetch stock market news
router.get('/', (req, res) => {
  execFile('python', ['./python/news_scraper.py'], (error, stdout, stderr) => {
    if (error) {
      console.error("Error executing Python script:", error);
      return res.status(500).json({ error: "Failed to fetch news" });
    }

  //   console.log("STDOUT:", stdout); // Log this!
  // console.error("STDERR:", stderr);
    try {
      const newsData = JSON.parse(stdout);
      res.json(newsData);
    } catch (parseError) {
      console.error("Error parsing Python script output:", parseError);
      res.status(500).json({ error: "Invalid news data format" });
    }
  });
});

module.exports = router;
