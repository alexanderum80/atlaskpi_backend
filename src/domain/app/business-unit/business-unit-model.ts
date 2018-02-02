import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { IBusinessUnitDocument, IBusinessUnitModel } from './business-unit';
import { tagsPlugin } from '../tags/tag.plugin';

const BusinessUnitSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    serviceType: String
});

// add tags capabilities
BusinessUnitSchema.plugin(tagsPlugin);

BusinessUnitSchema.statics.createNew = function(name: string, serviceType: string): Promise<IBusinessUnitDocument> {
    const that = <IBusinessUnitModel> this;

    return new Promise<IBusinessUnitDocument>((resolve, reject) => {
        if (!name ) {
            return reject('Information not valid');
        }

        that.create({
            name: name,
            serviceType: serviceType
        }).then(businessunit => {
            resolve(businessunit);
        }).catch(err => {
            logger.error(err);
            reject('There was an error adding the business unit');
        });
    });
};

BusinessUnitSchema.statics.updateBusinessUnit = function(_id: string, name: string, serviceType: string): Promise<IBusinessUnitDocument> {
    const that = <IBusinessUnitModel> this;
    return new Promise<IBusinessUnitDocument>((resolve, reject) => {

        if (!name) {
            return reject('Information not valid');
        }

        that.findByIdAndUpdate(_id, {
           name: name,
           serviceType: serviceType
        }).then(businessunit => {
            resolve(businessunit);
        }).catch(err => {
            logger.error(err);
            reject('There was an error updating the bussiness unit');
        });
    });
};

BusinessUnitSchema.statics.deleteBusinessUnit = function(_id: string): Promise<IBusinessUnitDocument> {
    const that = <IBusinessUnitModel> this;

    return new Promise<IBusinessUnitDocument>((resolve, reject) => {
            that.findByIdAndRemove (_id).then(businessunit => {
                resolve(businessunit);
            }).catch(err => {
                logger.error(err);
                reject('There was an error updating the business unit');
            });

        // });

    });
};

BusinessUnitSchema.statics.businessUnits = function(): Promise<IBusinessUnitDocument[]> {
    const that = <IBusinessUnitModel> this;

    return new Promise<IBusinessUnitDocument[]>((resolve, reject) => {
        that.find({}).then(businessunit => {
            resolve(businessunit);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving business unit');
        });
    });
};

BusinessUnitSchema.statics.businessUnitById = function(id: string): Promise<IBusinessUnitDocument> {
    const that = <IBusinessUnitModel> this;

    return new Promise<IBusinessUnitDocument>((resolve, reject) => {
        that.findOne({_id: id}).then(businessunit => {
            resolve(businessunit);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving business unit');
        });
    });
};

@injectable()
export class BusinessUnits extends ModelBase<IBusinessUnitModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'BusinessUnit', BusinessUnitSchema, 'business-unit');
    }
}