import * as Bluebird from 'bluebird';
import { inject, injectable } from 'inversify';
import { Job, Queue } from 'kue';
import * as moment from 'moment';
import * as os from 'os';

import { config } from '../../configuration/config';
import { AppConnection } from '../../domain/app/app.connection';
import { GoogleAnalytics } from '../../domain/app/google-analytics/google-analytics.model';
import { IDateRange } from '../../domain/common/date-range';
import { FrequencyEnum } from '../../domain/common/frequency-enum';
import { Connectors } from '../../domain/master/connectors/connector.model';
import { AppConnectionPool } from '../../middlewares/app-connection-pool';
import { GoogleAnalyticsKPIService } from '../kpis/google-analytics-kpi/google-analytics-kpi.service';
import { IOAuth2Token } from './../../domain/common/oauth2-token';

const googleapis = require('googleapis');

const traverse = (obj, keys) => { return keys.split('.').reduce((cur, key) => cur[key], obj); };

// let queue = require('kue');

export interface IGARequestParameters {
    analyticsConfig: any;
    authToken: any;
    subdomain: string;
    analyticsFn: string;
    payload?: any;
}

export interface IGAJobData {
    accountName: string;
    dbUri: string;
    dataSource: string;
    dateRange: IDateRange[];
    metric: string;
    frequency: FrequencyEnum;
    filters: string;
    groupings: string[];
}

let queue = require('kue');
// let Queue = kue.createQueue();
let _jobs: Queue;

try {
    _jobs = queue.createQueue({
        prefix: os.hostname(), // 'webapp',
        redis: {
            port: config.cache.redisPort, // 6379,
            host: config.cache.redisServer, // 'localhost'
        }
    });

    console.log('Queue name: ' + os.hostname);
} catch (e) {
    console.error('There was an error connecting to Redis Server');
}

// queue.app.listen(4000);

const JOB_TYPE: string = 'ga';
const JOB_TYPE_REQUEST: string = 'ga_request';

@injectable()
export class GAJobsQueueService {
    private _lastTime: moment.Moment;

    constructor(
        @inject(Connectors.name) private _connectors: Connectors,
        @inject(AppConnectionPool.name) private _connPool: AppConnectionPool,
        @inject(GoogleAnalyticsKPIService.name) private _gaKpiService: GoogleAnalyticsKPIService
    ) {
         this._startProcessingJobs();
         this._startProcessingGARequests();
    }

    addGAJob(
        accountName: string,
        dbUri: string,
        dataSource: string,
        dateRange: IDateRange[],
        metric: string,
        frequency: FrequencyEnum,
        filters: string,
        groupings: string[]): Job {
            // this._lastTime = this._lastTime.add(10, 'seconds');
            if (!_jobs) {
                console.log('Job queue is not ready to receive new jobs');
                return;
            }

            const jobData = {
                title: `Google Analytics Query for:${accountName}, date range: ${JSON.stringify(dateRange)}`,
                accountName, dbUri, dataSource, dateRange, metric, frequency, filters, groupings };

                const job = _jobs.createJob(JOB_TYPE, jobData);

            // return new Promise<Job>((resolve, reject) => {
                // console.log(`Run at: ` + this._lastTime.format('HH:mm:ss'));
                // const job = _jobs.createJob(JOB_TYPE, jobData)
                job.save(function(err: any, data: any) {
                    if (err) {
                        console.error('There was an error creating job');
                    }
                    else {
                        console.log(`Job created, name: "ga", data: ${JSON.stringify(jobData)}`);
                    }
                });
            // });
        return job;
    }

    private _startProcessingJobs() {
        const that = this;
        this._lastTime = moment();

        if (!_jobs) {
            console.log('Job queue is not ready to proccess new jobs');
            return;
        }

        _jobs.process(JOB_TYPE, async function(job: Job, done) {
            const data: IGAJobData = job.data;

            try {
                // get the instances that we need
                const conn = await that._connPool.getConnection(job.data.dbUri);
                const appConnection = new AppConnection({ appConnection: conn } as any);
                const ga = new GoogleAnalytics(appConnection);
                const gaKpiService = new GoogleAnalyticsKPIService(ga, that._connectors);

                const dr = data.dateRange && data.dateRange[0];
                const startDate = moment(dr.from).format('YYYY-MM-DD');
                const endDate = moment(dr.to).format('YYYY-MM-DD');
                const gaRes = await gaKpiService.initializeConnection(data.dataSource);
                const jobId = `${job.id}.${moment().unix()}`;
                const result = await gaKpiService.cacheData(
                                    jobId,
                                    gaRes.analytics,
                                    gaRes.authClient,
                                    startDate,
                                    endDate,
                                    data.metric,
                                    data.frequency,
                                    data.filters,
                                    data.groupings);

                done(null, result);
            } catch (e) {
                done(e);
            }
        });
    }

    queuedGARequest(options: IGARequestParameters): Promise<any> {
        const {
            analyticsConfig,
            authToken,
            subdomain,
            analyticsFn,
            payload
        } = options;

        if (!analyticsConfig || !authToken || !analyticsFn) throw new Error('Invalid parameters');

        const jobPayload = {
            options,
            title: `Google Analytics request on behalf :${subdomain}, function name: ${analyticsFn}, with payload: ${JSON.stringify(payload)}`,
        };

        const job = _jobs.createJob(JOB_TYPE_REQUEST, jobPayload);

        return new Promise<any>((resolve, reject ) => {
            job.save((err, res) => {
                if (err) return reject(err);
                console.log(`Job created, name: "request", data: ${JSON.stringify(jobPayload)}`);

                job.on('complete', function(result) {
                    console.log('Job completed. title: ', jobPayload.title);
                    return resolve(result);
                }).on('failed', function(err) {
                    console.log('Job failed');
                    return reject(err);
                });
            });
        });
    }

    private _startProcessingGARequests() {

        if (!_jobs) {
            console.log('Job queue is not ready to proccess new jobs');
            return;
        }

        const that = this;

        _jobs.process(JOB_TYPE_REQUEST, async function(job: Job, done) {
            const {
                analyticsConfig,
                authToken,
                subdomain,
                analyticsFn,
                payload
            } = job.data.options;

            if (!analyticsConfig || !authToken || !analyticsFn) done(new Error('Invalid parameters'));

            const analytics = that._generateAnalyticsObject(analyticsConfig, authToken, subdomain);
            try {
                const fn = traverse(analytics, analyticsFn);
                const reqPromise = (<any>Bluebird.promisify<any>(fn))(payload);
                const result = await Bluebird.delay(100, reqPromise);
                done(null, result);
            } catch (err) {
                done(err);
            }
        });
    }

    private _generateAnalyticsObject(config: any, token: IOAuth2Token, quotaUser?: string): any {
        if (!config || !token) {
            throw('missing arguments');
        }
        const oauth2Client = new googleapis.auth.OAuth2(
            config.clientId,
            config.clientSecret,
            ''
        );

        oauth2Client.credentials = token;
        googleapis.options({
            auth: oauth2Client,
            quotaUser: quotaUser
        });

        return googleapis.analytics('v3');
    }
}