const Quotation = require('../models/Quotation');
const Counter = require('../models/Counter');

// @desc    Create new quotation
// @route   POST /api/quotations
// @access  Private
const createQuotation = async (req, res) => {
    const { customerName, items } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No quotation items' });
    }

    try {
        const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        // Generate sequential quotation number
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'quotationNumber' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const quotationNumber = `QO-${counter.seq.toString().padStart(4, '0')}`;

        const quotation = new Quotation({
            customerName,
            items,
            totalAmount,
            quotationNumber,
        });

        const createdQuotation = await quotation.save();
        res.status(201).json(createdQuotation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all quotations
// @route   GET /api/quotations
// @access  Private
const getQuotations = async (req, res) => {
    try {
        const quotations = await Quotation.find({}).sort('-createdAt');
        res.json(quotations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get quotation by ID
// @route   GET /api/quotations/:id
// @access  Private
const getQuotationById = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);

        if (quotation) {
            res.json(quotation);
        } else {
            res.status(404).json({ message: 'Quotation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete quotation
// @route   DELETE /api/quotations/:id
// @access  Private
const deleteQuotation = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);

        if (quotation) {
            await Quotation.deleteOne({ _id: req.params.id });
            res.json({ message: 'Quotation removed' });
        } else {
            res.status(404).json({ message: 'Quotation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createQuotation,
    getQuotations,
    getQuotationById,
    deleteQuotation,
};
