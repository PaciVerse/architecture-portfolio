const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  sendMessage,
  getMessages,
  deleteMessage
} = require('../controllers/contactController');

router.post('/', sendMessage);
router.get('/', auth, getMessages);
router.delete('/:id', auth, deleteMessage);

module.exports = router;