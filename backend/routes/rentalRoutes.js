const express = require('express');
const router = express.Router();
const { createRental, getRentals, renewRental } = require('../controllers/rentalController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createRental).get(protect, getRentals);
router.route('/:id/renew').put(protect, renewRental);

module.exports = router;
