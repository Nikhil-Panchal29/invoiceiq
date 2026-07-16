const express = require('express');

const { chat } = require('../controllers/assistantController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all assistant routes
router.use(protect);

// Chat with AI assistant
router.post('/chat', chat);

module.exports = router;
