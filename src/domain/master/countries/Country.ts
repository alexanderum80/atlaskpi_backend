import * as mongoose from 'mongoose';

export interface ICountry {
    name: string;
    continent: string;
}

export interface ICountryDocument extends ICountry, mongoose.Document {

}

export interface ICountryModel extends mongoose.Model<ICountryDocument> {

}