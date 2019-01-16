import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

import { NotificationSourceEnum } from '../../master/notification/notification';

export interface IScheduleJob {
    type: NotificationSourceEnum;
    active: boolean;
    timezone: string;
    cronSchedule?: string[];
    dateSchedule?: Date[];
    data: any;
  }

  export interface IScheduleJobModelInfo {
    name: string;
    id: string;
}

export interface IScheduleJobInfo {
    notifyUsers: string[];
    frequency: string;
    active: boolean;
    pushNotification: boolean;
    emailNotified: boolean;
    timezone: string;
    modelAlert: IScheduleJobModelInfo;
    dayOfMonth: number;
    timestamp?: Date;
}

export interface IScheduleJobDocument extends IScheduleJob, mongoose.Document {

}

// export interface IScheduleJobDocument extends IScheduleJobInfo, mongoose.Document {}

export interface IScheduleJobModel extends mongoose.Model<IScheduleJobDocument> {
    scheduleJobByWidgetId(model: string): Promise<IScheduleJobDocument[]>;
    createScheduleJob(input: IScheduleJobInfo): Promise<IScheduleJobDocument>;
    updateScheduleJob(id: string, input: IScheduleJobInfo): Promise<IScheduleJobDocument>;
    updateScheduleJobActive(id: string, active: boolean): Promise<IScheduleJobDocument>;
    removeScheduleJob(id: string): Promise<IScheduleJobDocument>;
    removeScheduleJobByModelId(id: string): Promise<IScheduleJobDocument>;
    removeDeleteUser(id: string): Promise<IScheduleJobDocument>;
}
