const Sale = require('../models/Sale');
const Part = require('../models/Part');
const Machine = require('../models/Machine');

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res) => {
    const { customerName, items, paidAmount } = req.body;

    if (items && items.length === 0) {
        res.status(400).json({ message: 'No sale items' });
        return;
    }

    let totalAmount = 0;
    let totalProfit = 0;

    try {
        // Process items and calculate totals
        const processedItems = await Promise.all(
            items.map(async (item) => {
                let inventoryItem;
                let itemType;

                if (item.part) {
                    inventoryItem = await Part.findById(item.part);
                    itemType = 'part';
                } else if (item.machine) {
                    inventoryItem = await Machine.findById(item.machine);
                    itemType = 'machine';
                }

                if (!inventoryItem) {
                    throw new Error(`Item not found: ${item.part || item.machine}`);
                }

                if (inventoryItem.stock < item.quantity) {
                    throw new Error(`Insufficient stock for: ${inventoryItem.name}`);
                }

                // Update stock
                inventoryItem.stock -= item.quantity;
                await inventoryItem.save();

                const itemTotal = inventoryItem.price * item.quantity;
                const itemProfit = itemTotal * 0.2; // 20% default profit

                totalAmount += itemTotal;
                totalProfit += itemProfit;

                return {
                    part: itemType === 'part' ? item.part : undefined,
                    machine: itemType === 'machine' ? item.machine : undefined,
                    name: inventoryItem.name,
                    quantity: item.quantity,
                    price: inventoryItem.price,
                };
            })
        );

        const initialPaid = Number(paidAmount) || totalAmount;
        const dueAmount = totalAmount - initialPaid;

        const sale = new Sale({
            customerName,
            items: processedItems,
            totalAmount,
            profit: totalProfit,
            dueAmount: dueAmount,
            paidAmount: initialPaid,
            paymentStatus: dueAmount > 0 ? 'Partial' : 'Paid',
            payments: [{
                amount: initialPaid,
                method: 'Cash', // Default for initial
                paymentDate: Date.now()
            }]
        });

        const createdSale = await sale.save();
        res.status(201).json(createdSale);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Record payment for an existing sale
// @route   POST /api/sales/:id/payment
// @access  Private
const recordSalePayment = async (req, res) => {
    const { amount, method, paymentDate } = req.body;

    try {
        const sale = await Sale.findById(req.params.id);

        if (sale) {
            const paymentAmount = Number(amount);
            sale.paidAmount += paymentAmount;
            sale.dueAmount -= paymentAmount;

            if (sale.dueAmount <= 0) {
                sale.dueAmount = 0;
                sale.paymentStatus = 'Paid';
            } else {
                sale.paymentStatus = 'Partial';
            }

            sale.payments.push({
                amount: paymentAmount,
                method: method || 'Cash',
                paymentDate: paymentDate || Date.now()
            });

            const updatedSale = await sale.save();
            res.json(updatedSale);
        } else {
            res.status(404).json({ message: 'Sale not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
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
    try {
        const sale = await Sale.findById(req.params.id).populate('items.part items.machine', 'name category');

        if (sale) {
            res.json(sale);
        } else {
            res.status(404).json({ message: 'Sale not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete sale and revert stock
// @route   DELETE /api/sales/:id
// @access  Private
const deleteSale = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);

        if (sale) {
            // Revert stock for each item in the sale
            await Promise.all(
                sale.items.map(async (item) => {
                    if (item.part) {
                        const part = await Part.findById(item.part);
                        if (part) {
                            part.stock += item.quantity;
                            await part.save();
                        }
                    } else if (item.machine) {
                        const machine = await Machine.findById(item.machine);
                        if (machine) {
                            machine.stock += item.quantity;
                            await machine.save();
                        }
                    }
                })
            );

            await Sale.deleteOne({ _id: req.params.id });
            res.json({ message: 'Sale removed and stock reverted' });
        } else {
            res.status(404).json({ message: 'Sale not found' });
        }
    } catch (error) {
        console.error('Error deleting sale:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createSale, getSales, getSaleById, deleteSale, recordSalePayment };
