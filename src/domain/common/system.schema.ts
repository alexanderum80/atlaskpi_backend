import * as mongoose from 'mongoose';

export function SystemSchema() {
    return new mongoose.Schema({
        section: String,
        system: String,
        image: String
    });
}

