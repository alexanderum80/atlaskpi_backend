import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';
import { IOperationHoursInfo } from '../../common/location-info.model';

export interface ILocation {
    name: string;
    description: string;
    alias: string;
    businessunits: string;
    street: string;
    country: string;
    city: string;
    state: string;
    zip: string;
    timezone: string;
    operhours: IOperationHoursInfo[];
}

export interface ILocationInput {
    name: string;
    description: string;
    alias: string;
    businessunits: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zip: string;
    timezone: string;
    operhours: [IOperationHoursInfo];
}

export interface ILocationDocument extends ILocation, mongoose.Document {

}

export interface ILocationModel extends mongoose.Model<ILocationDocument> {
    createLocation(input: ILocationInput): Promise<ILocationDocument>;
    updateLocation(id: string, input: ILocationInput): Promise<ILocationDocument>;
    locations(): Promise<ILocationDocument[]>;
    locationById(id: string): Promise<ILocationDocument>;
    deleteLocation(_id: string): Promise<ILocationDocument>;
}