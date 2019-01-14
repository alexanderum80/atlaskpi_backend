import { isEmpty, isBoolean } from 'lodash';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as BlueBird from 'bluebird';
import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { IScheduleJobDocument, IScheduleJobInfo, IScheduleJobModel } from './schedule-job';
export const JobScheduleSchema = new mongoose.Schema({
    active: { type: Boolean, required: true },
    type: { type: String, required: true },
    timezone: { type: String, required: true },
    cronSchedule: { type: [String] },
    dateSchedule: { type: [Date] },
    data: { type: mongoose.Schema.Types.Mixed },
});

JobScheduleSchema.statics.scheduleJobByWidgetId = function(id: string): BlueBird<IScheduleJobDocument[]> {
    const scheduleJobModel = (<IScheduleJobModel>this);

    return new BlueBird<IScheduleJobDocument[]>((resolve, reject) => {
        scheduleJobModel.find({ 'scheduleJobModel.id': id })
            .then((result: IScheduleJobDocument[]) => {
                resolve(result);
                return;
            })
            .catch(err => {
                reject(err);
                return;
            });
    });
};

JobScheduleSchema.statics.createScheduleJob = function(input: IScheduleJobInfo): BlueBird<IScheduleJobDocument> {
    const scheduleJobModel = (<IScheduleJobModel>this);

    return new BlueBird<IScheduleJobDocument>((resolve, reject) => {
        if (!input || isEmpty(input)) {
            reject({ name: 'no data provided', message: 'no data provided' });
            return;
        }

        scheduleJobModel.create(input)
            .then((result: IScheduleJobDocument) => {
                resolve(result);
                return;
            })
            .catch(err => {
                reject(err);
                return;
            });
    });
};

JobScheduleSchema.statics.updateScheduleJob = function(id: string, input: IScheduleJobInfo): BlueBird<IScheduleJobDocument> {
    const scheduleJobModel = (<IScheduleJobModel>this);

    return new BlueBird<IScheduleJobDocument>((resolve, reject) => {
        if (!id) {
            reject({ name: 'no id', message: 'no id has been provided' });
        }
        if (!input || isEmpty(input)) {
            reject({ name: 'no data provided', message: 'no data provided' });
            return;
        }

        scheduleJobModel.findByIdAndUpdate(id, input).then((alert: IScheduleJobDocument) => {
            resolve(alert);
            return;
        })
        .catch(err => {
            reject(err);
            return;
        });
    });
};

JobScheduleSchema.statics.updateScheduleJobActiveField = function(id: string, active: boolean): BlueBird<IScheduleJobDocument> {
    const scheduleJobModel = (<IScheduleJobModel>this);

    return new BlueBird<IScheduleJobDocument>((resolve, reject) => {
        if (!isBoolean(active)) {
            reject({ name: 'no active value', message: 'no active provided'});
            return;
        }

        if (!id) {
            reject({ name: 'no id', message: 'no id provided'});
            return;
        }

        scheduleJobModel.findById(id).then(alert => {
            if (alert) {
                alert.active = active;
                alert.save((err, alert: IScheduleJobDocument) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(alert);
                    return;
                });
            }
        }).catch(err => {
            reject(err);
        });
    });
};

JobScheduleSchema.statics.removeScheduleJob = function(id: string): BlueBird<IScheduleJobDocument> {
    const scheduleJobModel = (<IScheduleJobModel>this);

    return new BlueBird<IScheduleJobDocument>((resolve, reject) => {
        if (!id) {
            reject({ name: 'no id', message: 'no id provided' });
        }

        scheduleJobModel.findById(id).then((scheduleJob: IScheduleJobDocument) => {
            if (!scheduleJob) {
                reject({ name: 'no ScheduleJob found', message: 'no ScheduleJob found' });
                return;
            }

            scheduleJob.remove((err, deletedAlert) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(scheduleJob);
                return;
            });
        });
    });
};

JobScheduleSchema.statics.removeScheduleJobByModelId = function(id: string): BlueBird<IScheduleJobDocument> {
    const scheduleTaskModel = (<IScheduleJobModel>this);

    return new BlueBird<IScheduleJobDocument>((resolve, reject) => {
        if (!id) {
            reject({ name: 'no id', message: 'no id provided' });
            return;
        }

        scheduleTaskModel.findOne({ 'data.identifier': id }).then((scheduleJob: IScheduleJobDocument) => {
            if (!scheduleJob) {
                resolve(null);
                return;
            }

            scheduleJob.remove((err: any, deletedAlert: IScheduleJobDocument) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(scheduleJob);
                return;
            });
        }).catch(err => {
            reject(err);
        });
    });
};

JobScheduleSchema.statics.removeDeleteUser = async function(id: string): Promise<boolean> {
    const alertModel = (<IScheduleJobModel>this);
    try {
        const removeUser = await this.update(
            {}, {
                'notifyUsers': {
                    $in: [id]
                }
            }, {
                multi: true
            }).exec();

        return removeUser;
    } catch (err) {
        return err;
    }
};

@injectable()
export class ScheduleJobs extends ModelBase<IScheduleJobModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'ScheduleJob', JobScheduleSchema, 'scheduleJobs');
    }
}
