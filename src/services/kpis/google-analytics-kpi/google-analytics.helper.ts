import * as moment from 'moment-timezone';

import { FrequencyEnum, getFrequencyPropName } from './../../../domain/common/frequency-enum';
import { randomInteger } from './../../../helpers/number.helpers';

const GOOGLE_ANALYTICS_LAUNCH_DATE = '2005-01-01';

const DEFAULT_METRICS = [
    'ga:users',
    'ga:newUsers',
    'ga:sessions',
    'ga:sessionsPerUser',
    'ga:pageviews',
    'ga:pageviewsPerSession',
    'ga:avgSessionDuration',
    'ga:bounceRate'
];

const DEFAULT_DATE_DIMENSION = 'ga:year';

const DEFAULT_DIMENSIONS = [
    'ga:browser',
    'ga:country',
    'ga:city',
    'ga:deviceCategory',
    'ga:language',
    'ga:operatingSystem'
];

export const groupingDimensionsMap = {
    browser: 'ga:browser',
    country: 'ga:country',
    city: 'ga:city',
    deviceCategory: 'ga:deviceCategory',
    language: 'ga:language',
    operatingSystem: 'ga:operatingSystem'
};

export const fieldMetricsMap = {
    users: 'ga:users',
    newUsers: 'ga:newUsers',
    sessions: 'ga:sessions',
    sessionsPerUser: 'ga:sessionsPerUser',
    pageviews: 'ga:pageviews',
    pageviewsPerSession: 'ga:pageviewsPerSession',
    avgSessionDuration: 'ga:avgSessionDuration',
    bounceRate: 'ga:bounceRate'
};

export const frequencyDimensionsMap = {
    day: 'ga:date',
    week: 'ga:isoYearIsoWeek',
    month: 'ga:yearMonth',
    quarter: null,
    year: 'ga:year'
};

const dateDimensions = ['date', 'isoYearIsoWeek', 'yearMonth', 'year'];

export const cleanHeaders = (headers): string[] => headers.map(h => h.name.replace('ga:', ''));
export const groupingsToDimensions = (groupings): string[] => groupings.map(g => groupingDimensionsMap[g]);

export interface IGetAnalyticsOptions {
    startDate?: string;
    endDate?: string;
    metrics?: string[];
    dimensions?: string[];
    extraOpts?: any;
}

export interface IBatchProperties {
    _batchId: string;
    _batchTimestamp: Date;
}

export function generateBatchProperties(connectorId: string, viewId: string): IBatchProperties {
    const timestamp = moment();
    return {
        _batchId: `${timestamp.unix()}.${connectorId}.${viewId}.${randomInteger(10)}`,
        _batchTimestamp: timestamp.toDate()
    };
}

/**
 * All google analytics query should go thru this function
 */
export function  getAnalyticsData(  analyticsObj: any,
                                    authClient: any,
                                    viewId: string,
                                    options: IGetAnalyticsOptions = {}
    ): Promise<any> {

    let startDate = options.startDate || 'today';
    const endDate = options.endDate || 'today';
    const metrics = options.metrics || DEFAULT_METRICS;
    const dimensions = options.dimensions || [DEFAULT_DATE_DIMENSION];

    // MINIMUN DATE CANNOT BE LESS THAN GOOGLE ANALYTICS LAUNCH DATE
    if ( moment(startDate).isBefore(moment(GOOGLE_ANALYTICS_LAUNCH_DATE))) {
        startDate = GOOGLE_ANALYTICS_LAUNCH_DATE;
    }

    const queryObj = {
        auth: authClient,
        'ids': `ga:${viewId}`,
        'start-date': startDate,
        'end-date': endDate,
        'metrics': metrics.join(','),
        'dimensions': dimensions.slice(0, 7).join(','), // maximun 7 dimentions allowed by google
        ... options.extraOpts || {} // if you know google analytics api you can add parameters to the request here.
    };

    return new Promise<any>((resolve, reject) => {
        analyticsObj.data.ga.get(queryObj, (err, res) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(res);
        });
    });
}


export function mapMetricDimensionRow(row: any, headers: string[], tz: string = 'Etc/Universal'): any {
    const line = {};
        // loop thru headers and create an object with the  headers as key
    headers.forEach((h, index) => {
        const dateDimension = dateDimensions.find(id => id === h);
        const key = dateDimension ? 'date' : h;
        line[key] = dateDimension
                    // create the date object based on the timezone of the google analytic view
                    ? parseGoogleAnalyticsDatesDimentions(h, row[index], tz)
                    : row[index];
    });

    return line;
}

export function parseGoogleAnalyticsDatesDimentions(id: string, value: any, tz: string): any {
    switch (id) {
        case 'date':
            return moment.tz(value, tz).toDate();

        case 'isoYearIsoWeek':
            const year = id.substr(0, 4);
            const week = id.substr(4, 2);
            return moment.tz(`${year}-W${week}`, tz).toDate();

        case 'yearMonth':
            return moment.tz(`${value}01`, tz).toDate();

        case 'year':
            return moment.tz(`${value}-01-01`, tz).toDate();

        default:
            return value;
    }
}

export function constructDimensionsArray(groupings: string[], frequency?: FrequencyEnum): string[] {
    const groupingDimensions = groupingsToDimensions(groupings || []);
    const frequencyPropName = (frequency === FrequencyEnum.Daily || frequency) && getFrequencyPropName(frequency) || null;
    const frequencyDimension = frequencyPropName && frequencyDimensionsMap[frequencyPropName];

    return  frequency === FrequencyEnum.Daily || frequency
            ? [frequencyDimension, ...groupingDimensions]
            : [...groupingDimensions];
}