import { ModelBase } from '../../../type-mongo';
import { MasterConnection } from '../master.connection';
import { injectable, inject } from 'inversify';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as validate from 'validate.js';
import * as winston from 'winston';
import { IIndustryDocument, IIndustryModel } from './industry';

// define mongo schema

let Schema = mongoose.Schema;

let SubIndustrySchema = new Schema({
    name: String
});

let IndustrySchema = new mongoose.Schema({
    name: { type: String, index: true, required: true },
    subIndustries: [SubIndustrySchema]
});

// static methods
IndustrySchema.statics.findAll = function(): Promise<IIndustryDocument[]> {
    let that = this;

    return new Promise<IIndustryDocument[]>((resolve, reject) => {

        that.find({}).then((industries) => {
            if (industries) {
                resolve(industries);
            } else {
                throw { code: 404, message: 'Industries not found' };
            }
        });
   });
};

@injectable()
export class Industries extends ModelBase<IIndustryModel> {
    constructor(@inject('MasterConnection') appConnection: MasterConnection) {
        super(appConnection, 'Industry', IndustrySchema, 'industries');
    }
}
