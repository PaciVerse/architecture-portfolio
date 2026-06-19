const express = require('express');
const router = express.Router();
const visitorAuth = require('../middleware/visitorAuth');
const {
  getProjectLikes,
  checkLike,
  toggleLike
} = require('../controllers/likeController');

router.get('/:projectId', getProjectLikes);
router.get('/:projectId/check', visitorAuth, checkLike);
router.post('/:projectId', visitorAuth, toggleLike);

module.exports = router;