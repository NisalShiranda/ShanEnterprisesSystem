const mongoose = require('mongoose');

const rentalSchema = mongoose.Schema(
    {
        customerName: {
            type: String,
            required: true,
        },
        machine: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Machine',
        },
        startDate: {
            type: Date,
            required: true,
        },
        nextRenewalDate: {
            type: Date,
            required: true,
        },
        monthlyRate: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            required: true,
            default: 'Active', // Active, Completed, Overdue
        },
        invoices: [
            {
                invoiceDate: { type: Date, required: true },
                amount: { type: Number, required: true },
                status: { type: String, required: true, default: 'Unpaid' },
            },
        ],
        totalPaid: {
            type: Number,
            default: 0,
        },
        payments: [
            {
                paymentDate: { type: Date, default: Date.now },
                amount: { type: Number, required: true },
                method: { type: String, default: 'Cash' },
            }
        ]
    },
    {
        timestamps: true,
    }
);

const Rental = mongoose.model('Rental', rentalSchema);

module.exports = Rental;
