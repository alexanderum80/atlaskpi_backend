import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface Location {
    externalId: string;
    address1?: string;
    address2?: string;
    name: string;
    city?: string;
    state?: string;
    zip?: string;
}

export interface IBusinessUnitAlias {
    source: string;
    externalId: string;
    name: string;
}

export interface IBusinessUnit {
    name: string;
    aliases: IBusinessUnitAlias[];
    locations: Location[];
}

export interface IBusinessUnitDocument extends IBusinessUnit, mongoose.Document { }

export interface IBusinessUnitModel extends mongoose.Model<IBusinessUnitDocument> { }
