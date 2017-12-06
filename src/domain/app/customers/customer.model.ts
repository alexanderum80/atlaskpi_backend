import {
    ModelBase
} from '../../../type-mongo';
import {
    AppConnection
} from '../app.connection';
import {
    injectable,
    inject
} from 'inversify';
import {
    Address
} from '../../common';
import {
    ICustomerModel
} from './customer';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

let Schema = mongoose.Schema;

let CustomerSchema = new Schema({
    firstName: {
        type: String
    },
    middleName: {
        type: String
    },
    lastName: {
        type: String
    },
    gender: {
        type: Boolean
    },
    dob: Date,
    address: Address
});

// CustomerSchema.methods.

// CustomerSchema.statics.

@injectable()
export class Customers extends ModelBase < ICustomerModel > {
    constructor(@inject('AppConnection') appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Customer', CustomerSchema, 'customers');
    }
}