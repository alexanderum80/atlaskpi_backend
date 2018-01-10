import { Address } from '../../common/address.model';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { ICustomerModel } from './customer';

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
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Customer', CustomerSchema, 'customers');
    }
}