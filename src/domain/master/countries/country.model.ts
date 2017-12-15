import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';

import { ModelBase } from '../../../type-mongo/model-base';
import { MasterConnection } from '../master.connection';
import { ICountryModel } from './Country';


const countrySchema = new mongoose.Schema({
    _id: String,
    name: String,
    continent: String
});

@injectable()
export class Countries extends ModelBase<ICountryModel> {
    constructor(@inject('MasterConnection') appConnection: MasterConnection) {
        super();
        this.initializeModel(appConnection.get, 'Country', countrySchema, 'countries');
    }
}