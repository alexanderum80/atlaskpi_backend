import { config } from '../../../configuration/config';
import { IUserMilestoneNotifier } from '../../../services/notifications/users/user-milestone.notification';
import { AppConnection } from '../app.connection';
import { ModelBase } from '../../../type-mongo/model-base';
import { IUserModel } from '../security/users/user';
import { IMilestoneDocument, IMilestoneModel, IMilestoneNotificationInput } from './milestone';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as logger from 'winston';
import * as nodemailer from 'nodemailer';
import { inject, injectable } from 'inversify';


let Schema = mongoose.Schema;

let MilestoneSchema = new Schema({
    target: { type: String, required: true },
    task: { type: String, required: true },
    dueDate: { type: Date, required: true },
    status: String,
    responsible: [{ type: String, required: true }]
});

MilestoneSchema.statics.createMilestone = function(target: string, task: string, dueDate: string, status: string, responsible: string[]):
    Promise<IMilestoneDocument> {

    const that = <IMilestoneModel> this;

    return new Promise<IMilestoneDocument>((resolve, reject) => {
        if (!target || !task || !dueDate  || !responsible) {
            return reject('Information not valid');
        }

        const newMilestoneData = {
            target: target,
            task: task,
            dueDate: dueDate,
            status: status,
            responsible: responsible
        };

        that.create(newMilestoneData)
        .then(milestone => resolve(
            milestone
        ))
        .catch(err => {
            logger.error(err);
            reject('There was an error adding the milestone');
        });
    });
};

MilestoneSchema.statics.updateMilestone = function(_id: string, target: string, task: string, dueDate: string, status: string, responsible: string[]):
    Promise<IMilestoneDocument> {

    const that = <IMilestoneModel> this;

    return new Promise<IMilestoneDocument>((resolve, reject) => {
        if (!target || !task || !dueDate  || !responsible) {
            return reject('Information not valid');
        }

        const updateMilestoneData = {
            target: target,
            task: task,
            dueDate: dueDate,
            status: status,
            responsible: responsible
        };

        that.findByIdAndUpdate(_id, updateMilestoneData).then(milestone => resolve(milestone))
        .catch(err => {
            logger.error(err);
            reject('There was an error updating the milestone');
        });
    });
};

MilestoneSchema.statics.deleteMilestone = function(_id: string):
Promise<IMilestoneDocument> {

const that = <IMilestoneModel> this;

return new Promise<IMilestoneDocument>((resolve, reject) => {
    if (!_id) {
        return reject('Information not valid');
    }

    that.findByIdAndRemove(_id).then(milestone => resolve(milestone))
    .catch(err => {
        logger.error(err);
        reject('There was an error deleting the milestone');
    });
});
};

MilestoneSchema.statics.updateMilestoneStatus = function(milestone: IMilestoneDocument): Promise<IMilestoneDocument> {

    const that = <IMilestoneModel> this;

    return new Promise<IMilestoneDocument>((resolve, reject) => {
        if (!milestone._id) {
            return reject('Information not valid');
        }
        const format = 'MM/DD/YYYY';

        const current = moment();
        const currentDate = moment(current, format);

        const forbiddenPastDate = moment(milestone.dueDate, format).isBefore(currentDate);

        if (forbiddenPastDate && milestone.status === 'Due') {
            that.findByIdAndUpdate(milestone._id, { status: 'Declined' }).then(milestone => resolve(milestone))
            .catch(err => {
                logger.error(err);
                reject('There was an error update the milestone status');
                return;
            });
        } else {
            resolve(milestone);
            return;
        }
    });
};

MilestoneSchema.statics.milestoneNotifier = function(input: IMilestoneNotificationInput, user: any, notifier: IUserMilestoneNotifier): Promise<nodemailer.SentMessageInfo> {
    const that = this;
    return new Promise<nodemailer.SentMessageInfo>((resolve, reject) => {
        let condition = {};
        const usernameField = config.usersService.usernameField;

        if (usernameField === 'email') {
            condition['emails'] = { $elemMatch: { address: input.email  } };
        } else {
            condition['username'] = input.email;
        }

        user.findOne(condition).then((user) => {
            if (!user) {
                reject({ name: 'notfound', message: 'Account not found' });
                return;
            }

            notifier.notify(user, input.email, input).then((sentEmailInfo) => {
                resolve(sentEmailInfo);
            }, (err) => {
                throw { name: 'email', message: err.message };
            });
        }, (err) => {
            reject({ message: 'Milestone Notification token could not be generated', error: err });
        });
    });
};


MilestoneSchema.statics.milestonesByTarget = function(target: string): Promise<IMilestoneDocument[]> {
    const that = <IMilestoneModel> this;

    return new Promise<IMilestoneDocument[]>((resolve, reject) => {
        that.find({target: target}).then(milestones => {
            resolve(milestones);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving milestones');
        });
    });
};

// MilestoneSchema.statics.milestonesByTarget = function(target: string): Promise<IMilestoneDocument[]> {
//     return  (this as IMilestoneModel).find({target: target}).exec();
// };


@injectable()
export class Milestones extends ModelBase<IMilestoneModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Milestones', MilestoneSchema, 'milestones');
    }
}