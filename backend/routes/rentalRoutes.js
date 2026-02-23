const express = require('express');
const router = express.Router();
const { createRental, getRentals, renewRental, recordPayment } = require('../controllers/rentalController');
const { protect } = require('../middleware/authMiddleware');

router.get('/ping', (req, res) => res.send('Rentals route is working'));

router.post('/', protect, createRental);
router.get('/', protect, getRentals);

router.put('/:id/renew', protect, renewRental);
router.post('/:id/payment', protect, recordPayment);

module.exports = router;
