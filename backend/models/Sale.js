const mongoose = require('mongoose');

const saleSchema = mongoose.Schema(
    {
        customerName: {
            type: String,
            required: true,
        },
        items: [
            {
                part: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: false,
                    ref: 'Part',
                },
                machine: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: false,
                    ref: 'Machine',
                },
                name: { type: String, required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
            default: 0,
        },
        profit: {
            type: Number,
            required: true,
            default: 0,
        },
        dueAmount: {
            type: Number,
            required: true,
            default: 0,
        },
        paymentStatus: {
            type: String,
            required: true,
            default: 'Paid', // Paid, Partial, Due
        },
    },
    {
        timestamps: true,
    }
);

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
