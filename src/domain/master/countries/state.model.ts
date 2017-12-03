import { ModelBase } from '../../../type-mongo';
import { MasterConnection } from '../master.connection';
import { injectable, inject } from 'inversify';
import { IStateModel } from './';
import * as mongoose from 'mongoose';


const stateSchema = new mongoose.Schema({
    _id: String,
    country: String,
    name: String,
    code: String
});

@injectable()
export class States extends ModelBase<IStateModel> {
    constructor(@inject('MasterConnection') appConnection: MasterConnection) {
        super(appConnection, 'State', stateSchema, 'states');
    }
}