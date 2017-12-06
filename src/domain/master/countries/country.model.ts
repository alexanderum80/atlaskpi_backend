import { ModelBase } from '../../../type-mongo';
import { MasterConnection } from '../master.connection';
import { injectable, inject } from 'inversify';
import { ICountryModel } from './country';
import * as mongoose from 'mongoose';

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