import * as mongoose from 'mongoose';

export function UsersSchema() {
    return new mongoose.Schema({
        username: String,
        tockens: String
    });
}

