import { injectable, inject } from 'inversify';
import { Queue, Job } from 'kue';
import { GoogleAnalyticsKPIService } from '../kpis/google-analytics-kpi/google-analytics-kpi.service';
import { IDateRange } from '../../domain/common/date-range';
import { FrequencyEnum } from '../../domain/common/frequency-enum';
import * as moment from 'moment';

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

let queue = require('kue-scheduler');
// let Queue = kue.createQueue();

const _jobs = queue.createQueue({
    prefix: 'webapp',
    redis: {
        port: 6379,
        host: 'localhost'
    }
});

queue.app.listen(4000);

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
        groupings: string[]): Promise<Job> {
            this._lastTime = this._lastTime.add(10, 'seconds');

            const jobData = {
                title: `Google Analytics Query for:${accountName}, date range: ${JSON.stringify(dateRange)}`,
                dataSource, dateRange, metric, frequency, filters, groupings };


            return new Promise<Job>((resolve, reject) => {
                console.log(`Run at: ` + this._lastTime.format('HH:mm:ss'));
                const job = _jobs.createJob(JOB_TYPE, jobData)
                // VERY IMPORTANT
                // add delay of 100 milliseconds between google analytics queries
                // .delay(this._lastTime.date())
                .save(function(err: any, data: any) {
                    if (err) {
                        console.error('There was an error creating job');
                        reject(err);
                    }
                    else {
                        console.log(`Job created, name: "ga", data: ${JSON.stringify(jobData)}`);
                        resolve(job);

                    }
                });

                // _jobs.schedule('5 seconds from now', job);
            });
    }

    private _startProcessingJobs() {
        const that = this;
        this._lastTime = moment();

        _jobs.process(JOB_TYPE, function(job, done) {
            const data: IGAJobData = job.data;

            const dr = data.dateRange && data.dateRange[0];
            const startDate = moment(dr.from).format('YYYY-MM-DD');
            const endDate = moment(dr.to).format('YYYY-MM-DD');

            that._gaKpiService
                .initializeConnection(data.dataSource)
                .then(gaRes => {
                    that._gaKpiService
                    .cacheData( gaRes.analytics,
                                gaRes.authClient,
                                startDate,
                                endDate,
                                data.metric,
                                data.frequency,
                                data.filters,
                                data.groupings)
                    .then(res => {
                        setTimeout(() => done(null, res), 500);
                    })
                    .catch(err => done(err));
                });
        });
    }

}