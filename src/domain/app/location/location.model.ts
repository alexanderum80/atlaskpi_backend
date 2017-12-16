import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { ILocation, ILocationDocument, ILocationModel } from './location';

const LocationSchema = new mongoose.Schema({
    name: String,
    description: String,
    alias: String,
    businessunits: String,
    operhours: String,
    street: String,
    city: String,
    state: String,
    zip: String
});

LocationSchema.statics.createLocation = function(input: ILocation): Promise < ILocationDocument > {

    const that = this;

    return new Promise < ILocationDocument > ((resolve, reject) => {
        if (!input.name) {
            return reject('Information not valid');
        }
        that.create({
            input
        }).then(location => {
            resolve(location);
        }).catch(err => {
            logger.error(err);
            reject('There was an error adding the location');
        });
    });
};

LocationSchema.statics.updateLocation = function(id: string, input: ILocation): Promise < ILocationDocument > {

    const that = < ILocationModel > this;

    return new Promise < ILocationDocument > ((resolve, reject) => {
        if (!input.name) {
            return reject('Information not valid');
        }
        that.findByIdAndUpdate(id, {
            input
        }).then(location => {
            resolve(location);
        }).catch(err => {
            logger.error(err);
            reject('There was an error updating the location');
        });
    });
};

LocationSchema.statics.deleteLocation = function(_id: string): Promise < ILocationDocument > {
    const that = < ILocationModel > this;

    return new Promise < ILocationDocument > ((resolve, reject) => {
        that.findByIdAndRemove(_id).then(location => {
            resolve(location);
        }).catch(err => {
            logger.error(err);
            reject('There was an error updating the location');
        });
    });
};

LocationSchema.statics.locations = function(): Promise < ILocationDocument[] > {
    const that = < ILocationModel > this;

    return new Promise < ILocationDocument[] > ((resolve, reject) => {
        that.find({}).then(location => {
            resolve(location);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving locations');
        });
    });
};

LocationSchema.statics.locationById = function(id: string): Promise<ILocationDocument> {
    const that = <ILocationModel> this;
    return new Promise<ILocationDocument>((resolve, reject) => {
        that.findOne({_id: id}).then(location => {
            resolve(location);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving department');
        });
    });
};

@injectable()
export class Locations extends ModelBase < ILocationModel > {
    constructor(@inject('AppConnection') appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Location', LocationSchema, 'locations');
    }
}