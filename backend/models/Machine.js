const mongoose = require('mongoose');

const machineSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        price: {
            type: Number,
            required: true,
            default: 0,
        },
        rentalPricePerMonth: {
            type: Number,
            required: true,
            default: 0,
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Machine = mongoose.model('Machine', machineSchema);

module.exports = Machine;
