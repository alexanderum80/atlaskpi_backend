import * as mongoose from 'mongoose';

export function getLocationSchema() {
    return new mongoose.Schema({
        externalId: String,
        name: String,
        address1: String,
        address2: String,
        city: String,
        state: String,
        zip: String,
    });
    
}