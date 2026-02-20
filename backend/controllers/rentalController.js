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

// @desc    Get all rentals
// @route   GET /api/rentals
// @access  Private
const getRentals = async (req, res) => {
    const rentals = await Rental.find({}).populate('machine', 'name category');
    res.json(rentals);
};

// @desc    Update rental (e.g., generate monthly invoice)
// @route   PUT /api/rentals/:id/renew
// @access  Private
const renewRental = async (req, res) => {
    const rental = await Rental.findById(req.params.id);

    if (rental) {
        const nextRenewal = new Date(rental.nextRenewalDate);

        // Add new invoice
        rental.invoices.push({
            invoiceDate: nextRenewal,
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

module.exports = { createRental, getRentals, renewRental };
