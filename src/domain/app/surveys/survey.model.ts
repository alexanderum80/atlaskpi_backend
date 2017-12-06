import { ModelBase } from '../../../type-mongo';
import { AppConnection } from '../app.connection';
import { injectable, inject } from 'inversify';
import * as mongoose from 'mongoose';
import { ISurveyModel } from './ISurvey';

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
    constructor(@inject('AppConnection') appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Survey', SurveySchema, 'surveys');
    }
}
