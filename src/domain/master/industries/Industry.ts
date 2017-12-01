import mongoose = require('mongoose');
import * as Promise from 'bluebird';
import { IIndustryModel, IIndustryDocument, IIndustry } from './IIndustry';
import { IMutationResponse, MutationResponse } from '../..';
import { getContext } from '../../../models';
import { config } from '../../../../config';
import * as validate from 'validate.js';
import * as winston from 'winston';

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

export function getIndustryModel(): IIndustryModel {
    return <IIndustryModel>mongoose.model('Industry', IndustrySchema, 'industries');
};
