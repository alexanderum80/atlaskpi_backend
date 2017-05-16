import { Address } from '../../common';
import { ICustomerModel } from './ICustomer';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

let Schema = mongoose.Schema;

let CustomerSchema = new Schema({
    firstName: { type: String },
    middleName: { type: String },
    lastName: { type: String },
    gender: { type: Boolean },
    dob: Date,
    address: Address
});

// CustomerSchema.methods.

// CustomerSchema.statics.

export function getCustomerModel(m: mongoose.Connection): ICustomerModel {
    return <ICustomerModel>m.model('Customer', CustomerSchema, 'customers');
}