const express = require('express');
const router = express.Router();

module.exports = (userProjectMap, projectUserMap) => {
    router.get('/connected-data', (req, res) => {
        const connectedUsers = [];

        for (const [userId, projectId] of Object.entries(userProjectMap)) {
            connectedUsers.push({ userId, projectId });
        }

        res.status(200).json({ users: connectedUsers });
    });

    return router;
};
