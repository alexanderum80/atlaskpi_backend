import { AppConnection } from './../app.connection';
import { ModelBase } from './../../../type-mongo/model-base';
import * as Promise from 'bluebird';
import { injectable, inject } from 'inversify';
import { uniq } from 'lodash';
import * as mongoose from 'mongoose';

import { IGoogleAnalytics } from './google-analytics';

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
    bounceRate: Number
});

GoogleAnalyticsSchema.statics.batchUpsert = function(data: IGoogleAnalytics[]): Promise<string[]> {
    const that = this;
    return new Promise<string[]>((resolve, reject) => {
        const dates = uniq(data.map(d => d.date));
        that.remove({ date: { $in:  dates }}, (err) => {
            if (err) {
                reject(err);
                return;
            }

            that.insertMany(data, { continueOnError: true }, function(err, docs: any[]) {
                if (err) {
                    console.log(err);
                };

                that.find({ date: { $in:  dates }}, (err, foundDocs) => {
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

                    resolve(inserted);
                    return;
                });
            });
        });
    });
};

@injectable()
export class GoogleAnalytics extends ModelBase<IGoogleAnalytics> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'GoogleAnalytics', GoogleAnalyticsSchema, 'googleAnalytics');
    }
}
