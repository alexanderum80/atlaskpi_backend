import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface ILocation {
    name: string;
    description: string;
    alias: string;
    businessunits: string;
    latitude: number;
    longitude: number;
    operhours: string;
    street: string;
    city: string;
    state: string;
    zip: string;
}

export interface ILocationDocument extends ILocation, mongoose.Document {

}

export interface ILocationModel extends mongoose.Model<ILocationDocument> { 
    createNew(
        name: string,
        description: string, 
        alias: string, 
        businessunits: string,
        latitude: number,
        longitude: number,
        operhours: string,
        street: string,
        city: string,
        state: string,
        zip: string): Promise<ILocationDocument>;
    
    updateLocation(
        _id: string,
        name: string,
        description: string, 
        alias: string, 
        businessunits: string,
        latitude: number,
        longitude: number,
        operhours: string,
        street: string,
        city: string,
        state: string,
        zip: string): Promise<ILocationDocument>;

    locations(): Promise<ILocationDocument[]>;
    deleteLocation(_id: string): Promise<ILocationDocument>;
}