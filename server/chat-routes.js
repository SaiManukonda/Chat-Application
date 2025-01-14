const express = require('express');
const msgDB = require('./msgDB');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' });
const router = express.Router();
// Active connections
const activeConnections = {};
const JWT_SECRET = process.env.JWT_SECRET;
var user = null;

//Middleware: check if token exists and is valid
checkToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized user.' });
    }

    try {
        user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};


// Route: Create a new message
const configureChatRoutes = (expressWs) => {
    router.get('/:user_id/:recepient_id', checkToken, async (req, res) => {
        if (!req.params.user_id || !req.params.recepient_id) {
            return res.status(400).json({ message: 'User ID and recipient ID are required.' });
        }
        if (!await msgDB.findUserById(req.params.user_id) || !await msgDB.findUserById(req.params.recepient_id)) {
            return res.status(400).json({ message: 'User or recepient does not exist.' });
        }
        const usernameById = await msgDB.findUserById(req.params.user_id);
        if (!user || user.username !== usernameById.username) {
            return res.status(401).json({ message: 'Unauthorized user.' });
        }
        try{
            const msgs = await msgDB.findAllMsgsById(req.params.user_id, req.params.recepient_id);
            res.json(msgs);
        } catch (err) {
            res.status(500).json({ message: 'Failed to get messages.' });
        }
    });    

    router.ws('/:user_id/:recepient_id', checkToken, async (ws, req) => {
        const { user_id, recepient_id } = req.params;
        const usernameById = await msgDB.findUserById(user_id);
        if (!user_id || !recepient_id) {
            ws.send(JSON.stringify({
                status: 'error',
                message: 'User ID and recipient ID are required.',
            }));
            ws.close();
        }

        if (!await msgDB.findUserById(user_id) || !await msgDB.findUserById(recepient_id)) {
            ws.send(JSON.stringify({
                status: 'error',
                message: 'User does not exist.',
            }));
            ws.close();
        }
        if (!user || user.username !== usernameById.username) {
            ws.send(JSON.stringify({
                status: 'error',
                message: 'Unauthorized user.',
            }));
            ws.close();
        }

        activeConnections[user_id] = ws;
        const recipientWs = activeConnections[recepient_id] || null;

        ws.on('message', async (msg) => {
            const { content } = JSON.parse(msg);
            if (content) {
                try {
                    const newMsg = await msgDB.createMsg(user_id, recepient_id, content);
                    
                    // Send the message to the recipient if they are connected
                    if (recipientWs) {
                        recipientWs.send(JSON.stringify({
                            status: 'success',
                            message: 'New message received!',
                            data: newMsg,
                        }));
                    }

                    ws.send(JSON.stringify({
                        status: 'success',
                        message: 'Message sent successfully!',
                        data: newMsg,
                    }));
                }
                catch (err) {
                    ws.send(JSON.stringify({
                        status: 'error',
                        message: 'Failed to send message.',
                    }));
                }
            }
        });

        ws.on('close', () => {
            ws.close();
        });
    });
    return router;
};
module.exports = configureChatRoutes;