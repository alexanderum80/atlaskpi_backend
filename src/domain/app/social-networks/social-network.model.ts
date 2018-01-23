import { inject, injectable } from 'inversify';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { ISocialNetworkModel } from './social-network';

const SocialNetworkSchema = new mongoose.Schema({
    refId: { type: String, unique: true },
    name: String!,
    date: { type: Date, default: new Date(moment().utc().format('YYYY-MM-DD')) },
    source: String!,
    metrics: mongoose.Schema.Types.Mixed,
});

@injectable()
export class SocialNetwork extends ModelBase<ISocialNetworkModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'SocialNetwork', SocialNetworkSchema, 'socialNetworks');
    }
}

