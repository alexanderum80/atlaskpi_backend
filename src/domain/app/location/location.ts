import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

export interface ILocation {
    name: string;
    description: string;
    alias: string;
    businessunits: string;
    operhours: string;
    street: string;
    city: string;
    state: string;
    zip: string;
}

export interface ILocationDocument extends ILocation, mongoose.Document {

}

export interface ILocationModel extends mongoose.Model<ILocationDocument> {
    createLocation(input: ILocation): Promise<ILocationDocument>;
    updateLocation(id: string, input: ILocation): Promise<ILocationDocument>;
    locations(): Promise<ILocationDocument[]>;
    locationById(id: string): Promise<ILocationDocument>;
    deleteLocation(_id: string): Promise<ILocationDocument>;
}