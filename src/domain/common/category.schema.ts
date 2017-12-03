import * as mongoose from 'mongoose';

export function getCategorySchema() {
    return new mongoose.Schema({
        externalId: String,
        name: String,
        service: Number
    });
}