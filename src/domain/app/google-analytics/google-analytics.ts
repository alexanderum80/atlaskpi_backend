import { IBatchProperties } from './../../../services/kpis/google-analytics-kpi/google-analytics.helper';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface IGoogleAnalytics {
    // id fields
    connector: {
        connectorId: string;
        connectorName: string;
        viewId: string;
    };

    websiteUrl: string;

    // Type String fields
    date: Date;
    browser?: string;
    city?: string;
    country?: string;
    deviceCategory?: string;
    language?: string;
    operatingSystem?: string;

    // numeric fields
    users?: number;
    newUsers?: number;
    sessions?: number;
    sessionsPerUser?: number;
    pageviews?: number;
    pageviewsPerSession?: number;
    avgSessionDuration?: number;
    bounceRate?: number;

    // we use this to identify the request
    _batchId: string;
    _batchTimestamp: Date;
}


export interface IGoogleAnalyticsDocument extends IGoogleAnalytics, mongoose.Document {
}

export interface IGoogleAnalyticsModel extends mongoose.Model<IGoogleAnalyticsDocument> {
    batchUpsert(data: any[], startDate: string, batchProps: IBatchProperties): Promise<IBatchProperties>;
}