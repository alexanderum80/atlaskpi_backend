import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

import { IBatchProperties } from './../../../services/kpis/google-analytics-kpi/google-analytics.helper';
import { ModelBase } from './../../../type-mongo/model-base';
import { AppConnection } from './../app.connection';
import { IGoogleAnalytics, IGoogleAnalyticsModel } from './google-analytics';

// define mongo schema
export const GoogleAnalyticsSchema = new mongoose.Schema({
    connector: {
        connectorId: String!,
        connectorName: String!,
        viewId: String!
    },

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

GoogleAnalyticsSchema.statics.batchUpsert = function(data: IGoogleAnalytics[], startDate: string, batchProps: IBatchProperties): Promise<IBatchProperties> {
    if (!data || !data.length) {
        return Promise.resolve(batchProps);
    }

    const that = this;
    const hasDate = data[0] && data[0].date;

    // if no date was requested to analytics lest use the start date
    if (!hasDate) {
        data.forEach(d => d.date = moment(startDate).toDate());
    }

    return new Promise<IBatchProperties>((resolve, reject) => {
        // clean old batches....
        that.remove({ _batchTimestamp: { $lt: moment().subtract(10, 'minutes') }}, (err) => {
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
