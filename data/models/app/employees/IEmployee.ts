import { IAddress } from '../../common';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export enum IEmployeeType {
    FULL_TIME,
    PART_TIME
}

export interface IEmployeeClassification {
    type: string; // f, p
    role: string; // physician, non physian, aest
}

export interface IEmployee {
    externalIdentifier: string;
    type: string;
    firstName: string;
    middleName: string;
    lastName: string;
    gender: boolean;
    dob: Date;
    employment: {
        from: Date,
        to: Date
    };
    nationality: string;
    countryOfBirth: string;
    organization: string;
    grade: string;
    payrollType: string;
    maritalStatus: string; // married, divorced, etc
    kids: number;
    religion: string;
    branch: string;

    address: IAddress;
    clasification: IEmployeeClassification;
}

export interface IEmployeeDocument extends IEmployee, mongoose.Document {

}

export interface IEmployeeModel extends mongoose.Model<IEmployeeDocument> { }