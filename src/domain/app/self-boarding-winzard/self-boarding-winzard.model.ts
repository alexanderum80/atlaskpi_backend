import { Address } from '../../common/address.model';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { ISelfBoardingWinzardDocument, ISelfBoardingWinzardInput, ISelfBoardingWinzardModel, ISelfBoardingWinzard } from './self-boarding-winzard';


let Schema = mongoose.Schema;

const SelfBoardingWinzardSchema = new  Schema({
        status: String,
        statePoint: String,
    });

SelfBoardingWinzardSchema.statics.createNew = function(selfBoardingWinzardInput: ISelfBoardingWinzardInput): Promise<ISelfBoardingWinzardDocument> {

    const that = this;

    return new Promise<ISelfBoardingWinzardDocument>((resolve, reject) => {
        if (!selfBoardingWinzardInput.status|| !selfBoardingWinzardInput.statePoint) {
            return reject('Information not valid');
        }

        that.create({
            status: selfBoardingWinzardInput.status,
            statePoint: selfBoardingWinzardInput.statePoint
        }).then(selftBoardingWinzard => {
            resolve(selftBoardingWinzard);
        }).catch(err => {
            logger.error(err);
            reject('There was an error adding the status of selft boarding winzard');
        });
    });
};

SelfBoardingWinzardSchema.statics.updateSelfBoardingWinzard = function(_id: string, selfBoardingWinzardInput: ISelfBoardingWinzardInput): Promise<ISelfBoardingWinzardDocument> {
    const that = <ISelfBoardingWinzardModel> this;

    return new Promise<ISelfBoardingWinzardDocument>((resolve, reject) => {
        if (!selfBoardingWinzardInput.status|| !selfBoardingWinzardInput.statePoint) {
            return reject('Information not valid');
        }

        that.findByIdAndUpdate(_id, {
            status: selfBoardingWinzardInput.status,
            statePoint: selfBoardingWinzardInput.statePoint
        }).then(selfBoardingWinzard => {
            resolve(selfBoardingWinzard);
        }).catch(err => {
            logger.error(err);
            reject('There was an error updating the status of selft boarding winzard');
        });
    });
};

SelfBoardingWinzardSchema.statics.deleteSelfBoardingWinzard = function(_id: string): Promise<ISelfBoardingWinzardDocument> {
    const that = <ISelfBoardingWinzardModel> this;

    return new Promise<ISelfBoardingWinzardDocument>((resolve, reject) => {
        that.findByIdAndRemove (_id).then(selfBoardingWinzard => {
                resolve(selfBoardingWinzard);
            }).catch(err => {
                logger.error(err);
                reject('There was an error removing the status of selft boarding winzard');
            });
    });
};

SelfBoardingWinzardSchema.statics.ListSelfBoardingWinzardQuery = function(): Promise<ISelfBoardingWinzardDocument[]> {
    const that = <ISelfBoardingWinzardModel> this;

    return new Promise<ISelfBoardingWinzardDocument[]>((resolve, reject) => {
        that.find({}).then(selfBoardingWinzard => {
            resolve(selfBoardingWinzard);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving status of selft boarding winzard');
        });
    });
};

SelfBoardingWinzardSchema.statics.selfBoardingWinzardById = function(id: string): Promise<ISelfBoardingWinzardDocument> {
    const that = <ISelfBoardingWinzardModel> this;

    return new Promise<ISelfBoardingWinzardDocument>((resolve, reject) => {
        that.findOne({_id: id}).then(selfBoardingWinzard => {
            resolve(selfBoardingWinzard);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving status of selft boarding winzard');
        });
    });
};

@injectable()
export class SelfBoardingWinzards extends ModelBase < ISelfBoardingWinzardModel > {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'SelfBoardingWinzards', SelfBoardingWinzardSchema ,'selfBoardingWinzard');
    }
}


