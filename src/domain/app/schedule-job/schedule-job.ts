import * as mongoose from 'mongoose';

import { NotificationSourceEnum } from '../../master/notification/notification';

export interface IScheduleJob {
    type: NotificationSourceEnum;
    active: boolean;
    timezone: string;
    cronSchedule?: string[];
    dateSchedule?: Date[];
    data: any;
  }

export interface IScheduleJobDocument extends IScheduleJob, mongoose.Document {

}

export interface IScheduleJobModel extends mongoose.Model<IScheduleJobDocument> {

}
