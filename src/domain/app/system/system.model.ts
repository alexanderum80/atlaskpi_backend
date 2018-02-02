import { Address } from '../../common/address.model';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { ISystemDocument, ISystemInput, ISystemModel, ISystem } from './system';

let Schema = mongoose.Schema;

const SystemSchema = new  Schema({
        section: String,
        system: String,
        image: String,
    });

SystemSchema.statics.createNew = function(systemInput: ISystemInput): Promise<ISystemDocument> {

    const that = this;

    return new Promise<ISystemDocument>((resolve, reject) => {
        if (!systemInput.section|| !systemInput.system   || !systemInput.image) {
            return reject('Information not valid');
        }

        that.create({
            section: systemInput.section,
            system: systemInput.system,
            image: systemInput.image
        }).then(system => {
            resolve(system);
        }).catch(err => {
            logger.error(err);
            reject('There was an error adding the system');
        });
    });
};

SystemSchema.statics.updateSystem = function(_id: string, systemInput: ISystemInput): Promise<ISystemDocument> {
    const that = <ISystemModel> this;

    return new Promise<ISystemDocument>((resolve, reject) => {
        if (!systemInput.section || !systemInput.system  || !systemInput.image) {
            return reject('Information not valid');
        }

        that.findByIdAndUpdate(_id, {
            section: systemInput.section,
            system: systemInput.system,
            image: systemInput.image
        }).then(system => {
            resolve(system);
        }).catch(err => {
            logger.error(err);
            reject('There was an error updating the system');
        });
    });
};

SystemSchema.statics.deleteSystem = function(_id: string): Promise<ISystemDocument> {
    const that = <ISystemModel> this;

    return new Promise<ISystemDocument>((resolve, reject) => {
        that.findByIdAndRemove (_id).then(system => {
                resolve(system);
            }).catch(err => {
                logger.error(err);
                reject('There was an error removing the system');
            });
    });
};

SystemSchema.statics.ListSystemQuery = function(): Promise<ISystemDocument[]> {
    const that = <ISystemModel> this;

    return new Promise<ISystemDocument[]>((resolve, reject) => {
        that.find({}).then(system => {
            resolve(system);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving system');
        });
    });
};

SystemSchema.statics.systemById = function(id: string): Promise<ISystemDocument> {
    const that = <ISystemModel> this;

    return new Promise<ISystemDocument>((resolve, reject) => {
        that.findOne({_id: id}).then(system => {
            resolve(system);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving system');
        });
    });
};

@injectable()
export class Systems extends ModelBase < ISystemModel > {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Systems', SystemSchema ,'system');
    }
}


