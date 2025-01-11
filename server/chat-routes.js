const express = require('express');
const msgDB = require('./msgDB');
require('dotenv').config({ path: '../.env' });
const router = express.Router();
// Active connections
const activeConnections = {};

// Route: Create a new message
const configureChatRoutes = (expressWs) => {
    router.get('/:user_id/:recepient_id', async (req, res) => {
        const msgs = await msgDB.findAllMsgsById(req.params.user_id, req.params.recepient_id);
        res.json(msgs);
    });    

    router.ws('/:user_id/:recepient_id', async (ws, req) => {
        const { user_id, recepient_id } = req.params;
        console.log('User ID:', user_id);
        console.log('Recipient ID:', recepient_id);
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