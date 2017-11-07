import { ILocationModel, ILocationDocument } from './ILocation';
import * as mongoose from 'mongoose';
import * as logger from 'winston';

const LocationSchema = new mongoose.Schema({
    name: String,
    description: String,
    alias: String,
    businessunits: String,
    latitude: Number,
    longitude: Number,
    operhours: String, 
    street: String, 
    city: String,
    state: String, 
    zip: String
});

LocationSchema.statics.createNew = function(
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
        zip: string): Promise<ILocationDocument> {
    
    const that = <ILocationModel> this;

    return new Promise<ILocationDocument>((resolve, reject) => {
        if (!name) {
            return reject('Information not valid');
        }
        that.create({
            name: name,
            alias: alias,
            description: description,
            businessunits: businessunits,
            latitude: latitude,
            longitude: longitude,
            operhours: operhours,
            street: street,
            city: city,
            state: state,
            zip: zip}).then(location => {
            resolve(location);
        }).catch(err => {
            logger.error(err);
            reject('There was an error adding the location');
        });
    });
};

LocationSchema.statics.updateLocation = function(
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
        zip: string): Promise<ILocationDocument> {
    
    const that = <ILocationModel> this;

    return new Promise<ILocationDocument>((resolve, reject) => {
        if (!name) {
            return reject('Information not valid');
        }
        that.findByIdAndUpdate(_id, {
            name: name,
            description: description,
            alias: alias,
            businessunits: businessunits,
            latitude: latitude,
            longitude: longitude,
            operhours: operhours,
            street: street,
            city: city,
            state: state,
            zip: zip}).then(location => {
            resolve(location);
        }).catch(err => {
            logger.error(err);
            reject('There was an error updating the location');
        });
    });
};

LocationSchema.statics.deleteLocation = function(_id: string): Promise<ILocationDocument> {
    const that = <ILocationModel> this;

    return new Promise<ILocationDocument>((resolve, reject) => {
        that.findByIdAndRemove (_id).then(location => {
            resolve(location);
        }).catch(err => {
            logger.error(err);
            reject('There was an error updating the location');
        });
    });
};

LocationSchema.statics.locations = function(): Promise<ILocationDocument[]> {
    const that = <ILocationModel> this;

    return new Promise<ILocationDocument[]>((resolve, reject) => {
        that.find({}).then(location => {
            resolve(location);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving locations');
        });
    });
};

export function getLocationModel(m: mongoose.Connection): ILocationModel {
    return <ILocationModel>m.model('Location', LocationSchema, 'locations');
}