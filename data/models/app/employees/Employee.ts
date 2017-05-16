import { Address } from '../../common';
import { IEmployeeModel } from './IEmployee';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

let Schema = mongoose.Schema;

let EmployeeSchema = new Schema({
    firstName: String,
    middleName: String,
    lastName: String,
    gender: Boolean,
    dob: Date,
    employment: {
        from: Date,
        to: Date
    },
    nationality: String,
    address: Address,
    clasification: {
        type: String,
        role: String
    }
});

// EmployeeSchema.methods.

// EmployeeSchema.statics.

export function getEmployeeModel(m: mongoose.Connection): IEmployeeModel {
    return <IEmployeeModel>m.model('Employee', EmployeeSchema, 'employees');
}