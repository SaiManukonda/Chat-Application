const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const pool = require('./schema');
require('dotenv').config({ path: '../.env' });
const authRoutes = require('./auth-routes');
const chatRoutes = require('./chat-routes');
const AuthDB = require('./AuthDB');
const expressWs = require('express-ws');
const fuzzy = require('fuzzy');
const cors = require('cors');

const app = express();
const wsInstance = expressWs(app);
const PORT = 3007;

app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true,
}));

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());

pool.initDb();

async function searchUsers(searchTerm) {
    const users = await AuthDB.findAllUsernames();
    const usernames = users.map(user => user.username);
    var results = fuzzy.filter(searchTerm, usernames);
    var matches = results.map(function(el) { return el.string; });
    console.log(matches);
    return matches;
}

app.get('/search', async (req, res) => {
    const searchTerm = req.query.q;
    const users = await searchUsers(searchTerm);
    res.json(users);
});

// Routes
app.use(authRoutes);
app.use('/protected', chatRoutes(wsInstance));


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
