import * as mongoose from 'mongoose';

export function ChartRunRateSchema() {
    return new mongoose.Schema({
        name: String,
        description: String,
        chart: String,
        startingFrom: String,
        periodPredict: String,
        title: String,
        frequency: String
    });
}

