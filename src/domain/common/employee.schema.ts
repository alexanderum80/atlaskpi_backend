import * as mongoose from 'mongoose';

export function getEmployeeSchema() {
    return new mongoose.Schema({
        externalId: String,
        fullName: String,
        role: String,
        type: String // full time (f), part time (p)
    });
}