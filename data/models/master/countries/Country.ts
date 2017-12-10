import { ICountryModel } from './ICountry';
import * as mongoose from 'mongoose';


const countrySchema = new mongoose.Schema({
    _id: String,
    name: String,
    continent: String
});


export function getCountryModel(): ICountryModel {
    return <ICountryModel>mongoose.model('Country', countrySchema, 'countries');
}