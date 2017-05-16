import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { IAddress } from '../../common';

export interface ILocation {
    name: string;
    address: IAddress
}

export interface ILocationDocument extends ILocation, mongoose.Document {

}

export interface ILocationModel extends mongoose.Model<ILocationDocument> { }