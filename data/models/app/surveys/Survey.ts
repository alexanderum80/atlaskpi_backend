import * as mongoose from 'mongoose';
import { ISurveyModel } from './ISurvey';

let Schema = mongoose.Schema;
let SurveySchema = new Schema({
    location: {
        id: String,
        name: String
    },
    customer: {
        id: String,
        name: String
    },
    employee: {
        id: String,
        name: String
    },
    product: {
        id: String,
        name: String
    },
    rate: Number
});

export function getSurveyModel(m: mongoose.Connection): ISurveyModel {
    return <ISurveyModel>m.model('Survey', SurveySchema, 'surveys');
}
