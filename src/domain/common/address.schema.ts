import * as mongoose from 'mongoose';

export function getAddressSchema() {
    return new mongoose.Schema({
        street1: { type: String },
        street2: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        zipCode: { type: String }    
    });
}
