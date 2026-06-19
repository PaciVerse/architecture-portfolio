const express = require('express');
const router = express.Router();
const visitorAuth = require('../middleware/visitorAuth');
const {
  getProjectReviews,
  addReview,
  deleteReview
} = require('../controllers/reviewController');

router.get('/:projectId', getProjectReviews);
router.post('/:projectId', visitorAuth, addReview);
router.delete('/:id', visitorAuth, deleteReview);

module.exports = router;