const mongoose = require('mongoose');

const quotationSchema = mongoose.Schema(
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
                description: { type: String },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
            default: 0,
        },
        quotationNumber: {
            type: String,
            required: true,
            unique: true,
        },
        date: {
            type: Date,
            default: Date.now,
        }
    },
    {
        timestamps: true,
    }
);

const Quotation = mongoose.model('Quotation', quotationSchema);

module.exports = Quotation;
