import { inject, injectable } from 'inversify';
import { Job, Queue } from 'kue';
import * as moment from 'moment';
import * as os from 'os';

import { config } from '../../configuration/config';
import { IDateRange } from '../../domain/common/date-range';
import { FrequencyEnum } from '../../domain/common/frequency-enum';
import { GoogleAnalyticsKPIService } from '../kpis/google-analytics-kpi/google-analytics-kpi.service';

// let queue = require('kue');

export interface IGAJobData {
    accountName: string;
    dataSource: string;
    dateRange: IDateRange[];
    metric: string;
    frequency: FrequencyEnum;
    filters: string;
    groupings: string[];
}

let queue = require('kue');
// let Queue = kue.createQueue();

const _jobs: Queue = queue.createQueue({
    prefix: os.hostname, // 'webapp',
    redis: {
        port: config.cache.redisPort, // 6379,
        host: config.cache.redisServer, // 'localhost'
    }
});

console.log('Queue name: ' + os.hostname);

// queue.app.listen(4000);

const JOB_TYPE: string = 'ga';

@injectable()
export class GAJobsQueueService {
    private _lastTime: moment.Moment;

    constructor(@inject(GoogleAnalyticsKPIService.name) private _gaKpiService: GoogleAnalyticsKPIService) {
        this._startProcessingJobs();
    }

    addGAJob(
        accountName: string,
        dataSource: string,
        dateRange: IDateRange[],
        metric: string,
        frequency: FrequencyEnum,
        filters: string,
        groupings: string[]): Job {
            // this._lastTime = this._lastTime.add(10, 'seconds');

            const jobData = {
                title: `Google Analytics Query for:${accountName}, date range: ${JSON.stringify(dateRange)}`,
                dataSource, dateRange, metric, frequency, filters, groupings };

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

        _jobs.process(JOB_TYPE, async function(job: Job, done) {
            const data: IGAJobData = job.data;

            try {
                const dr = data.dateRange && data.dateRange[0];
                const startDate = moment(dr.from).format('YYYY-MM-DD');
                const endDate = moment(dr.to).format('YYYY-MM-DD');
                const gaRes = await that._gaKpiService.initializeConnection(data.dataSource);
                const jobId = `${job.id}.${moment().unix()}`;
                const result = await that._gaKpiService.cacheData(
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

}