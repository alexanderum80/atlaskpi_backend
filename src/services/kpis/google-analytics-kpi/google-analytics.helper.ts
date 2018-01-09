import * as moment from 'moment-timezone';

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

const DATE_DIMENSION = 'ga:date';

const DEFAULT_DIMENSIONS = [
    'ga:browser',
    'ga:country',
    'ga:city',
    'ga:deviceCategory',
    'ga:language',
    'ga:operatingSystem'
];

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
        _batchId: `${timestamp.unix()}.${connectorId}.${viewId}`,
        _batchTimestamp: timestamp.toDate()
    };
}

/**
 * All google analytics query should go thru this function
 */
export function  getAnalyticsData(  analyticsObj: any,
                                    viewId: string,
                                    options: IGetAnalyticsOptions = {}
    ): Promise<any> {
    const startDate = options.startDate || 'today';
    const endDate = options.endDate || 'today';
    const metrics = options.metrics || DEFAULT_METRICS;
    let dimensions = [DATE_DIMENSION];

    if (options.dimensions) {
        dimensions = [...dimensions, ...options.dimensions];
    }

    const that = this;

    const queryObj = {
        auth: that._authClient,
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
        line[h] =   h === 'date'
                    // create the date object based on the timezone of the google analytic view
                    ? moment.tz(row[index], tz).toDate()
                    : row[index];
    });

    return line;
}