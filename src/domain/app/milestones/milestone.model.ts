import { AppConnection } from '../app.connection';
import { ModelBase } from '../../../type-mongo/model-base';
import { IUserModel } from '../security/users/user';
import { IUserMilestoneNotifier } from '../../../../services/notifications/users';
import { IMilestoneDocument, IMilestoneModel } from './milestone';
import { config } from '../../../../config';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as logger from 'winston';
import * as nodemailer from 'nodemailer';
import { inject, injectable } from 'inversify';


let Schema = mongoose.Schema;

let MilestoneSchema = new Schema({
    target: String,
    task: String,
    dueDate: String,
    status: String,
    responsible: [{ type: Schema.Types.String, ref: 'Employee' }]
});

MilestoneSchema.statics.createMilestone = function(target: string, task: string, dueDate: string, status: string, responsible: string[]):
    Promise<IMilestoneDocument> {

    const that = <IMilestoneModel> this;

    return new Promise<IMilestoneDocument>((resolve, reject) => {
        if (!target || !task || !dueDate || !status || !responsible) {
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
        .then(milestone => resolve(milestone))
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
        if (!target || !task || !dueDate || !status || !responsible) {
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

MilestoneSchema.statics.updateMilestoneStatus = function(_id: string):
Promise<IMilestoneDocument> {

const that = <IMilestoneModel> this;

return new Promise<IMilestoneDocument>((resolve, reject) => {
    if (!_id) {
        return reject('Information not valid');
    }

    that.findByIdAndUpdate(_id, { status: 'Declined' }).then(milestone => resolve(milestone))
    .catch(err => {
        logger.error(err);
        reject('There was an error update the milestone status');
    });
});
};

MilestoneSchema.statics.milestoneNotifier = function(email: string, notifier: IUserMilestoneNotifier): Promise<nodemailer.SentMessageInfo> {
    const that = this;
    return new Promise<nodemailer.SentMessageInfo>((resolve, reject) => {
        let condition = {};
        let usernameField = config.usersService.usernameField;

        if (usernameField === 'email') {
            condition['emails'] = { $elemMatch: { address: email  } };
        } else {
            condition['username'] = email;
        }

        (<IUserModel>that).findOne(condition).then((user) => {
            if (!user) {
                reject({ name: 'notfound', message: 'Account not found' });
                return;
            }

            notifier.notify(user, email, ).then((sentEmailInfo) => {
                resolve(sentEmailInfo);
            }, (err) => {
                throw { name: 'email', message: err.message };
            });
        }, (err) => {
            reject({ message: 'Milestone Notification token could not be generated', error: err });
        });
    });
};


@injectable()
export class Milestones extends ModelBase<IMilestoneModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Milestone', MilestoneSchema, 'milestones');
    }
}