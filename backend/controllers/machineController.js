const Machine = require('../models/Machine');

// @desc    Fetch all machines
// @route   GET /api/machines
// @access  Public
const getMachines = async (req, res) => {
    const machines = await Machine.find({});
    res.json(machines);
};

// @desc    Fetch single machine
// @route   GET /api/machines/:id
// @access  Public
const getMachineById = async (req, res) => {
    const machine = await Machine.findById(req.params.id);

    if (machine) {
        res.json(machine);
    } else {
        res.status(404).json({ message: 'Machine not found' });
    }
};

// @desc    Create a machine
// @route   POST /api/machines
// @access  Private/Admin
const createMachine = async (req, res) => {
    const { name, price, description, category, rentalPricePerMonth, stock } = req.body;

    const machine = new Machine({
        name,
        price,
        description,
        rentalPricePerMonth,
        stock,
    });

    const createdMachine = await machine.save();
    res.status(201).json(createdMachine);
};

// @desc    Update a machine
// @route   PUT /api/machines/:id
// @access  Private/Admin
const updateMachine = async (req, res) => {
    const { name, price, description, category, rentalPricePerMonth, stock } = req.body;

    const machine = await Machine.findById(req.params.id);

    if (machine) {
        machine.name = name || machine.name;
        machine.price = price || machine.price;
        machine.description = description || machine.description;
        machine.rentalPricePerMonth = rentalPricePerMonth || machine.rentalPricePerMonth;
        machine.stock = stock || machine.stock;

        const updatedMachine = await machine.save();
        res.json(updatedMachine);
    } else {
        res.status(404).json({ message: 'Machine not found' });
    }
};

// @desc    Delete a machine
// @route   DELETE /api/machines/:id
// @access  Private/Admin
const deleteMachine = async (req, res) => {
    const machine = await Machine.findById(req.params.id);

    if (machine) {
        await machine.deleteOne();
        res.json({ message: 'Machine removed' });
    } else {
        res.status(404).json({ message: 'Machine not found' });
    }
};

module.exports = {
    getMachines,
    getMachineById,
    createMachine,
    updateMachine,
    deleteMachine,
};
