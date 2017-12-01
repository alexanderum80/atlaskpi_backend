import * as mongoose from 'mongoose';

export function getProductSchema() {
    return new mongoose.Schema({
        externalId: String,
        itemCode: String,
        itemDescription: String,
        quantity: Number,
        unitPrice: Number,
        tax: Number,
        tax2: Number,
        amount: Number,
        paid: Number,
        discount: Number,
        from: Date,
        to: Date
    });
}