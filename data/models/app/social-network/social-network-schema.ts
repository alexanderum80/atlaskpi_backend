import * as moment from 'moment';
import * as mongoose from 'mongoose';

import { ISocialNetworkModel } from './ISocialNetwork';

const SocialNetworkSchema = new mongoose.Schema({
    refId: String!,
    name: String!,
    date: { type: Date, default: new Date(moment().utc().format('YYYY-MM-DD')) },
    source: String!,
    metrics: mongoose.Schema.Types.Mixed,
});

export function getSocialNetworkModel(m: mongoose.Connection): ISocialNetworkModel {
    return <ISocialNetworkModel>m.model('SocialNetwork', SocialNetworkSchema, 'socialNetworks');
}

