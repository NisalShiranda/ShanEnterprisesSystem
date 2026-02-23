const express = require('express');
const router = express.Router();
const { createRental, getRentals, renewRental, recordPayment, deleteRental } = require('../controllers/rentalController');
const { protect } = require('../middleware/authMiddleware');

// Diagnostic Logging
router.use((req, res, next) => {
    console.log(`Rentals Route: ${req.method} ${req.url}`);
    next();
});

router.get('/ping', (req, res) => res.send('Rentals route is working'));

router.post('/', protect, createRental);
router.get('/', protect, getRentals);

router.put('/:id/renew', protect, renewRental);
router.post('/:id/payment', protect, recordPayment);
router.delete('/delete-contract/:id', protect, deleteRental);

module.exports = router;
