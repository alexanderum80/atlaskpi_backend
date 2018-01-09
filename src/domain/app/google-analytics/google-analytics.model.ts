import { AppConnection } from './../app.connection';
import { ModelBase } from './../../../type-mongo/model-base';
import * as Promise from 'bluebird';
import { injectable, inject } from 'inversify';
import { uniq } from 'lodash';
import * as mongoose from 'mongoose';
import * as moment from 'moment';

import { IGoogleAnalytics, IGoogleAnalyticsModel } from './google-analytics';

// define mongo schema
export const GoogleAnalyticsSchema = new mongoose.Schema({
    connector: {
        connectorId: String!,
        connectorName: String!,
        viewId: String!
    },

    webPropertyId: String,
    accountId: String,
    websiteUrl: String,

    // Type String fields
    date: Date,
    browser: String,
    city: String,
    country: String,
    deviceCategory: String,
    language: String,
    operatingSystem: String,

    // numeric fields
    users: Number,
    newUsers: Number,
    sessions: Number,
    sessionsPerUser: Number,
    pageviews: Number,
    pageviewsPerSession: Number,
    avgSessionDuration: Number,
    bounceRate: Number,

    // we use this to identify the request
    _batchId: String,
    _batchTimestamp: Date
});

GoogleAnalyticsSchema.statics.batchUpsert = function(data: IGoogleAnalytics[]): Promise<{ _batchId: string, _batchTimestamp: Date }> {
    const that = this;
    const batchProps = { _batchId: data[0]._batchId, _batchTimestamp: data[0]._batchTimestamp };

    return new Promise<{ _batchId: string, _batchTimestamp: Date }>((resolve, reject) => {
        // clean old batches....
        that.remove({ date: { $lt: moment().subtract(10, 'minutes') }}, (err) => {
            if (err) {
                reject(err);
                return;
            }

            that.insertMany(data, { continueOnError: true }, function(err, docs: any[]) {
                if (err) {
                    console.log(err);
                }

                that.find({ _batchId: { $in:  batchProps._batchId }}, (err, foundDocs) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    let inserted = [];

                    if (!foundDocs || foundDocs.length === 0) {
                        inserted = [];
                    } else {
                        inserted = foundDocs.map(d => String(d.id));
                    }

                    resolve(batchProps);
                    return;
                });
            });
        });
    });
};

@injectable()
export class GoogleAnalytics extends ModelBase<IGoogleAnalyticsModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'GoogleAnalytics', GoogleAnalyticsSchema, 'googleAnalytics__temp');
    }
}
