const express = require('express');
const router = express.Router();
const { createSale, getSales, getSaleById, deleteSale, recordSalePayment } = require('../controllers/saleController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createSale).get(protect, getSales);
router.route('/:id').get(protect, getSaleById).delete(protect, deleteSale);
router.route('/:id/payment').post(protect, recordSalePayment);

module.exports = router;
