import * as mongoose from 'mongoose';

export function getCustomerSchema() {
        return new mongoose.Schema({
                externalId: String,
                city: String,
                state: String,
                zip: String,
                gender: String
        });
        
}