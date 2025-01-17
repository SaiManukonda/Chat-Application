const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authDB = require('./AuthDB');
require('dotenv').config({ path: '../.env' });
const router = express.Router();

// Secret for JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Route: Register a new user
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    if (await authDB.findUserByUserName(username) || await authDB.findUserByEmail(email)) {
        return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = await authDB.createUser(username,email, hashedPassword);

    // Generate a JWT token
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '8h' });

    // Send the token as a cookie
    res.cookie('token', token, { httpOnly: true });

    res.status(201).json({ message: 'User registered and logged in successfully!' });
});

// Route: Login user
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = await authDB.findUserByUserName(username);
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
router.get('/validate', (req, res) => {
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
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully!' });
});

router.post('/delete', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and Password are required.' });
    }

    const user = await authDB.findUserByUserName(username);
    if (!user) {
        return res.status(400).json({ message: 'User does not exist.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const deleted = await authDB.deleteUser(user.id);
    if (!deleted) {
        return res.status(500).json({ message: 'Error deleting user.' });
    }

    res.json({ message: 'User deleted successfully!' });
});

module.exports = router;