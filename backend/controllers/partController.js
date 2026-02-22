const Part = require('../models/Part');

// @desc    Fetch all parts
// @route   GET /api/parts
// @access  Public
const getParts = async (req, res) => {
    const parts = await Part.find({});
    res.json(parts);
};

// @desc    Fetch single part
// @route   GET /api/parts/:id
// @access  Public
const getPartById = async (req, res) => {
    const part = await Part.findById(req.params.id);

    if (part) {
        res.json(part);
    } else {
        res.status(404).json({ message: 'Part not found' });
    }
};

// @desc    Create a part
// @route   POST /api/parts
// @access  Private/Admin
const createPart = async (req, res) => {
    const { name, price, description, category, stock } = req.body;

    const part = new Part({
        name,
        price,
        description,
        stock,
    });

    const createdPart = await part.save();
    res.status(201).json(createdPart);
};

// @desc    Update a part
// @route   PUT /api/parts/:id
// @access  Private/Admin
const updatePart = async (req, res) => {
    const { name, price, description, category, stock } = req.body;

    const part = await Part.findById(req.params.id);

    if (part) {
        part.name = name || part.name;
        part.price = price || part.price;
        part.description = description || part.description;
        part.stock = stock || part.stock;

        const updatedPart = await part.save();
        res.json(updatedPart);
    } else {
        res.status(404).json({ message: 'Part not found' });
    }
};

// @desc    Delete a part
// @route   DELETE /api/parts/:id
// @access  Private/Admin
const deletePart = async (req, res) => {
    const part = await Part.findById(req.params.id);

    if (part) {
        await part.deleteOne();
        res.json({ message: 'Part removed' });
    } else {
        res.status(404).json({ message: 'Part not found' });
    }
};

module.exports = {
    getParts,
    getPartById,
    createPart,
    updatePart,
    deletePart,
};
