import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';

import { ModelBase } from '../../../type-mongo/model-base';
import { MasterConnection } from '../master.connection';
import { IStateModel } from './State';


const stateSchema = new mongoose.Schema({
    _id: String,
    country: String,
    name: String,
    code: String
});

@injectable()
export class States extends ModelBase<IStateModel> {
    constructor(@inject('MasterConnection') appConnection: MasterConnection) {
        super();
        this.initializeModel(appConnection.get, 'State', stateSchema, 'states');
    }
}