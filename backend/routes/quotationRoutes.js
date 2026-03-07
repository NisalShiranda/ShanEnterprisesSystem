const express = require('express');
const router = express.Router();
const {
    createQuotation,
    getQuotations,
    getQuotationById,
    deleteQuotation,
} = require('../controllers/quotationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createQuotation).get(protect, getQuotations);
router.route('/:id').get(protect, getQuotationById).delete(protect, deleteQuotation);

module.exports = router;
