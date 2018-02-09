import * as mongoose from 'mongoose';

export function SelfBoardingWinzardSchema() {
    return new mongoose.Schema({
        status: String,
        statePoint: String
    });
}

