const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const pool = require('./schema');
require('dotenv').config({ path: '../.env' });
const authRoutes = require('./auth-routes');
const chatRoutes = require('./chat-routes');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());

pool.initDb();

// Routes
app.use(authRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
