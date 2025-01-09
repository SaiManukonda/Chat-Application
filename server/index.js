const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());

// Secret for JWT
const JWT_SECRET = 'your_jwt_secret_key';

// Local dictionary to act as a database
const users = {};

// Route: Register a new user
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    if (users[username]) {
        return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user in the dictionary
    users[username] = { password: hashedPassword };

    // Generate a JWT token
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '8h' });

    // Send the token as a cookie
    res.cookie('token', token, { httpOnly: true });

    res.status(201).json({ message: 'User registered and logged in successfully!' });
});

// Route: Login user
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = users[username];
    if (!user) {
        return res.status(400).json({ message: 'User does not exist.' });
    }

    // Compare hashed passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate a JWT token
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '8h' });

    // Send the token as a cookie
    res.cookie('token', token, { httpOnly: true });
    res.json({ message: 'Logged in successfully!' });
});

// Route: Protected route
app.get('/protected', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ message: `Welcome, ${decoded.username}!` });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token.' });
    }
});

// Route: Logout user
app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
