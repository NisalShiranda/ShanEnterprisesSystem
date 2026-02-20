const Sale = require('../models/Sale');
const Rental = require('../models/Rental');
const Machine = require('../models/Machine');
const Part = require('../models/Part');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const sales = await Sale.find({});
        const rentals = await Rental.find({});

        const totalSales = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
        const totalProfit = sales.reduce((acc, sale) => acc + sale.profit, 0);
        const totalDue = sales.reduce((acc, sale) => acc + sale.dueAmount, 0);

        const activeRentals = rentals.filter(r => r.status === 'Active').length;
        const machinesCount = await Machine.countDocuments();
        const partsCount = await Part.countDocuments();

        // Rental income calculation (total from all invoices)
        let totalRentalIncome = 0;
        rentals.forEach(rental => {
            rental.invoices.forEach(invoice => {
                if (invoice.status === 'Paid' || invoice.status === 'Unpaid') { // Counting all for now
                    totalRentalIncome += invoice.amount;
                }
            });
        });

        res.json({
            totalSales,
            totalProfit,
            totalDue,
            activeRentals,
            machinesCount,
            partsCount,
            totalRentalIncome,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };
