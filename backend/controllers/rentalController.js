const Rental = require('../models/Rental');
const Machine = require('../models/Machine');

// @desc    Create new rental
// @route   POST /api/rentals
// @access  Private
const createRental = async (req, res) => {
    const { customerName, machineId, startDate, monthlyRate } = req.body;

    const machine = await Machine.findById(machineId);

    if (!machine) {
        res.status(404).json({ message: 'Machine not found' });
        return;
    }

    if (machine.stock <= 0) {
        res.status(400).json({ message: 'Machine out of stock' });
        return;
    }

    // Update stock
    machine.stock -= 1;
    await machine.save();

    const start = new Date(startDate);
    const nextRenewal = new Date(start);
    nextRenewal.setMonth(nextRenewal.getMonth() + 1);

    const rental = new Rental({
        customerName,
        machine: machineId,
        startDate: start,
        nextRenewalDate: nextRenewal,
        monthlyRate,
        invoices: [
            {
                invoiceDate: start,
                amount: monthlyRate,
                status: 'Unpaid',
            },
        ],
    });

    const createdRental = await rental.save();
    res.status(201).json(createdRental);
};

// @desc    Get all rentals (with auto-renewal check)
// @route   GET /api/rentals
// @access  Private
const getRentals = async (req, res) => {
    try {
        let rentals = await Rental.find({}).populate('machine', 'name category');

        // Check for renewals for all active rentals
        const now = new Date();
        let updatedCount = 0;

        for (let rental of rentals) {
            if (rental.status === 'Active' && now > new Date(rental.nextRenewalDate)) {
                let nextDate = new Date(rental.nextRenewalDate);

                while (now > nextDate) {
                    // Add new invoice
                    rental.invoices.push({
                        invoiceDate: new Date(nextDate),
                        amount: rental.monthlyRate,
                        status: 'Unpaid',
                    });

                    // Advance renewal date by 1 month
                    nextDate.setMonth(nextDate.getMonth() + 1);
                }

                rental.nextRenewalDate = nextDate;
                await rental.save();
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            // Re-fetch if updates happened to ensure consistency
            rentals = await Rental.find({}).populate('machine', 'name category');
        }

        res.json(rentals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Record a payment for a rental
// @route   POST /api/rentals/:id/payment
// @access  Private
const recordPayment = async (req, res) => {
    const { amount, method, paymentDate } = req.body;
    console.log(`Processing payment for rental ${req.params.id}:`, req.body);

    try {
        const rental = await Rental.findById(req.params.id);

        if (rental) {
            // Defensive: Initialize totalPaid if it's missing in legacy records
            if (typeof rental.totalPaid !== 'number') {
                rental.totalPaid = 0;
            }

            rental.totalPaid += Number(amount);
            rental.payments.push({
                amount: Number(amount),
                method: method || 'Cash',
                paymentDate: paymentDate || Date.now()
            });

            // Optionally mark invoices as paid if totalPaid covers them 
            // (Simple logic: just keep totalPaid vs totalBilled for now as balance)
            console.log('Updated rental data before save:', {
                totalPaid: rental.totalPaid,
                paymentCount: rental.payments.length
            });

            const updatedRental = await rental.save();
            res.json(updatedRental);
        } else {
            res.status(404).json({ message: 'Rental not found' });
        }
    } catch (error) {
        console.error('Error in recordPayment:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update rental (deprecated by auto-renewal in GET, but kept for manual triggers)
// @route   PUT /api/rentals/:id/renew
// @access  Private
const renewRental = async (req, res) => {
    const rental = await Rental.findById(req.params.id);

    if (rental) {
        const nextRenewal = new Date(rental.nextRenewalDate);

        // Add new invoice
        rental.invoices.push({
            invoiceDate: new Date(nextRenewal),
            amount: rental.monthlyRate,
            status: 'Unpaid',
        });

        // Update next renewal date
        nextRenewal.setMonth(nextRenewal.getMonth() + 1);
        rental.nextRenewalDate = nextRenewal;

        const updatedRental = await rental.save();
        res.json(updatedRental);
    } else {
        res.status(404).json({ message: 'Rental not found' });
    }
};

const deleteRental = async (req, res) => {
    try {
        console.log('Attempting to delete rental:', req.params.id);
        const rental = await Rental.findById(req.params.id);

        if (rental) {
            // Revert machine stock
            if (rental.machine) {
                console.log('Reverting stock for machine:', rental.machine);
                const machine = await Machine.findById(rental.machine);
                if (machine) {
                    machine.stock += 1;
                    await machine.save();
                    console.log('Stock reverted successfully');
                } else {
                    console.warn('Machine not found for rental, skipping stock reversion');
                }
            }

            await Rental.deleteOne({ _id: req.params.id });
            console.log('Rental deleted successfully');
            res.json({ message: 'Rental removed and machine stock reverted' });
        } else {
            res.status(404).json({ message: 'Rental not found' });
        }
    } catch (error) {
        console.error('Error in deleteRental:', error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

module.exports = { createRental, getRentals, renewRental, recordPayment, deleteRental };
