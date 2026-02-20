const Sale = require('../models/Sale');
const Part = require('../models/Part');

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res) => {
    const { customerName, items, dueAmount } = req.body;

    if (items && items.length === 0) {
        res.status(400).json({ message: 'No sale items' });
        return;
    }

    let totalAmount = 0;
    let totalProfit = 0;

    // Process items and calculate totals
    const processedItems = await Promise.all(
        items.map(async (item) => {
            const part = await Part.findById(item.part);
            if (!part) {
                throw new Error(`Part not found: ${item.part}`);
            }

            if (part.stock < item.quantity) {
                throw new Error(`Insufficient stock for part: ${part.name}`);
            }

            // Update stock
            part.stock -= item.quantity;
            await part.save();

            const itemTotal = part.price * item.quantity;
            // Assuming profit is a fixed percentage or based on cost price (not yet in model, using 20% default for now if cost not available)
            // Ideally part model should have costPrice. For now, let's assume price is selling price.
            const itemProfit = itemTotal * 0.2; // Placeholder profit calculation

            totalAmount += itemTotal;
            totalProfit += itemProfit;

            return {
                part: item.part,
                name: part.name,
                quantity: item.quantity,
                price: part.price,
            };
        })
    );

    const sale = new Sale({
        customerName,
        items: processedItems,
        totalAmount,
        profit: totalProfit,
        dueAmount: dueAmount || 0,
        paymentStatus: dueAmount > 0 ? 'Partial' : 'Paid',
    });

    const createdSale = await sale.save();
    res.status(201).json(createdSale);
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private/Admin
const getSales = async (req, res) => {
    const sales = await Sale.find({}).sort('-createdAt');
    res.json(sales);
};

// @desc    Get sale by ID
// @route   GET /api/sales/:id
// @access  Private
const getSaleById = async (req, res) => {
    const sale = await Sale.findById(req.params.id).populate('items.part', 'name category');

    if (sale) {
        res.json(sale);
    } else {
        res.status(404).json({ message: 'Sale not found' });
    }
};

module.exports = { createSale, getSales, getSaleById };
