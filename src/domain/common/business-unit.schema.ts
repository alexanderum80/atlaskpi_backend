import * as mongoose from 'mongoose';

export function getBusinessUnitSchema() {
    return new mongoose.Schema({
        name: String
    });
}
