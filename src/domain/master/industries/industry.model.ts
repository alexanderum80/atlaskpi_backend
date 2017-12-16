import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';

import { ModelBase } from '../../../type-mongo/model-base';
import { MasterConnection } from '../master.connection';
import { IIndustryDocument, IIndustryModel } from './Industry';


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
    constructor(@inject(MasterConnection.name) appConnection: MasterConnection) {
        super();
        this.initializeModel(appConnection.get, 'Industry', IndustrySchema, 'industries');
    }
}
