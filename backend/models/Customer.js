const mongoose = require('mongoose');

const customerSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        address: {
            type: String,
            trim: true
        },
        notes: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true,
    }
);

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
