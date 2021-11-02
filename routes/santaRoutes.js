const express = require('express');
const router = express.Router();
const { sendMessageToSanta } = require('../controllers/santaController');

router.post('/sendMessage', sendMessageToSanta);

module.exports = router;
