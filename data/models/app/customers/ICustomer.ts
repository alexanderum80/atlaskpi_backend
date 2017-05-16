import { IAddress } from '../../common';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface ICustomer {
    firstName: string;
    middleName: string;
    lastName: string;
    gender: boolean;
    dob: Date;
    address: IAddress;
}

export interface ICustomerDocument extends ICustomer, mongoose.Document {

}

export interface ICustomerModel extends mongoose.Model<ICustomerDocument> { }