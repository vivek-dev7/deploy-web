const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { execFile } = require('child_process');
require('dotenv').config();

const db = require('./config/db');
const tradeRoutes = require('./routes/tradeRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const authRoutes = require('./routes/authRoutes');
const updateRoutes = require('./routes/updateRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const yahooRoutes = require('./routes/yahooRoutes');
const newsRoutes = require('./routes/newsRoutes');
const recentlyVisitedRoutes = require('./routes/visitedRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['https://trade-sense-qr9q.vercel.app', process.env.FRONTEND_URL], // Add all allowed origins
    credentials: true // If you're using cookies/sessions
  }));
app.use(bodyParser.json());

// API routes
app.use('/api/trades', tradeRoutes);
app.use('/api/quote', quoteRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/update', updateRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/stock', yahooRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/recentlyVisited', recentlyVisitedRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
