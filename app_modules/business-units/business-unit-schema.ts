import {
    IBusinessUnitModel,
    IBusinessUnitDocument
} from './IBusinessUnit';
import * as mongoose from 'mongoose';
import * as logger from 'winston';

const BusinessUnitSchema = new mongoose.Schema({
    name: String,
    serviceType: String
});

BusinessUnitSchema.statics.createNew = function(name: string, serviceType: string): Promise < IBusinessUnitDocument > {
    const that = < IBusinessUnitModel > this;

    return new Promise < IBusinessUnitDocument > ((resolve, reject) => {
        if (!name) {
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

BusinessUnitSchema.statics.updateBusinessUnit = function(_id: string, name: string, serviceType: string): Promise < IBusinessUnitDocument > {
    const that = < IBusinessUnitModel > this;
    return new Promise < IBusinessUnitDocument > ((resolve, reject) => {

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

BusinessUnitSchema.statics.deleteBusinessUnit = function(_id: string): Promise < IBusinessUnitDocument > {
    const that = < IBusinessUnitModel > this;

    return new Promise < IBusinessUnitDocument > ((resolve, reject) => {
        that.findByIdAndRemove(_id).then(businessunit => {
            resolve(businessunit);
        }).catch(err => {
            logger.error(err);
            reject('There was an error updating the business unit');
        });

        // });

    });
};

BusinessUnitSchema.statics.businessUnits = function(): Promise < IBusinessUnitDocument[] > {
    const that = < IBusinessUnitModel > this;

    return new Promise < IBusinessUnitDocument[] > ((resolve, reject) => {
        that.find({}).then(businessunit => {
            resolve(businessunit);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving business unit');
        });
    });
};

BusinessUnitSchema.statics.businessUnitById = function(id: string): Promise < IBusinessUnitDocument > {
    const that = < IBusinessUnitModel > this;

    return new Promise < IBusinessUnitDocument > ((resolve, reject) => {
        that.findOne({
            _id: id
        }).then(businessunit => {
            resolve(businessunit);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving business unit');
        });
    });
};

export function getBusinessUnitModel(m: mongoose.Connection): IBusinessUnitModel {
    return <IBusinessUnitModel > m.model('BusinessUnit', BusinessUnitSchema, 'business-unit');
}