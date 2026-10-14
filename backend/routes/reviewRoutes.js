const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authMiddleware, comPapel } = require('../middleware/auth');

router.post('/create', authMiddleware, reviewController.createReview);
router.get('/:bookId', reviewController.getReviewsByBook);
router.delete('/:reviewId', authMiddleware, comPapel, reviewController.deleteReview);

module.exports = router;
