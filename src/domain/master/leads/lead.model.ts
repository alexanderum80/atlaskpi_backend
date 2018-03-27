import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';

import { ModelBase } from '../../../type-mongo/model-base';
import { MasterConnection } from '../master.connection';
import { ILeadModel } from './lead';


// define mongo schema
let leadSchema = new mongoose.Schema({
    company: { type: String, required: true },
    email: { type: String, required: true },
    fullName: { type: String, required: true }
});


@injectable()
export class Leads extends ModelBase<ILeadModel> {
    static Schema = leadSchema;

    constructor(@inject(MasterConnection.name) appConnection: MasterConnection) {
        super();
        this.initializeModel(appConnection.get, 'Lead', leadSchema, 'leads');
    }
}