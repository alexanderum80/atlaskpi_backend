import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { IAddress } from '../../common';

export interface ILocationAlias {
    source: string;
    externalId: string;
    name: string;
}

export interface ILocation {
    name: string;
    address: IAddress;
    aliases: ILocationAlias[];
}

export interface ILocationDocument extends ILocation, mongoose.Document {

}

export interface ILocationModel extends mongoose.Model<ILocationDocument> { }