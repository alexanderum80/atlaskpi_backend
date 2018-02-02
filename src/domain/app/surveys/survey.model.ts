import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { ISurveyModel } from './survey';


let Schema = mongoose.Schema;
let SurveySchema = new Schema({
    location: {
        id: String,
        name: String
    },
    customer: {
        id: String,
        name: String
    },
    employee: {
        id: String,
        name: String
    },
    product: {
        id: String,
        name: String
    },
    rate: Number
});

@injectable()
export class Surveys extends ModelBase<ISurveyModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Survey', SurveySchema, 'surveys');
    }
}
