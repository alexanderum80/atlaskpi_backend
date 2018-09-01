import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { IScheduleJobModel } from './schedule-job';

export const JobScheduleSchema = new mongoose.Schema({
    active: { type: Boolean, required: true },
    type: { type: String, required: true },
    timezone: { type: String, required: true },
    cronSchedule: { type: [String] },
    dateSchedule: { type: [Date] },
    data: { type: mongoose.Schema.Types.Mixed },
});

@injectable()
export class ScheduleJobs extends ModelBase<IScheduleJobModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'ScheduleJob', JobScheduleSchema, 'scheduleJobs');
    }
}
