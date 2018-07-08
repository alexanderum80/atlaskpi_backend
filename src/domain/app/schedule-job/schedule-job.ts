import * as mongoose from 'mongoose';

import { NotificationTypeEnum } from '../../master/notification/notification';

export interface IScheduleJob {
    type: NotificationTypeEnum;
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
