import { IUserMilestoneNotifier } from '../../../services/notifications/users/user-milestone.notification';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as nodemailer from 'nodemailer';

export interface IMilestone {
    task: string;
    dueDate: string;
    status: string;
    responsible: [string];
}

export interface IMilestoneNotificationInput {
    email: string;
    dueDate: string;
    fullName: string;
}

export interface IMilestoneDocument extends IMilestone, mongoose.Document {

}

export interface IMilestoneModel extends mongoose.Model<IMilestoneDocument> {
    createMilestone(target: string, task: string, dueDate: string, status: string, responsible?: string[]): Promise<IMilestoneDocument>;
    updateMilestone(_id: string, target: string, task: string, dueDate: string, status: string, responsible?: string[]): Promise<IMilestoneDocument>;
    deleteMilestone(_id: string): Promise<IMilestoneDocument>;
    updateMilestoneStatus(milestone: IMilestoneDocument): Promise<IMilestoneDocument>;
    /**
     * Request a user milestone notification email.
     * @param {string} email - user's email address
     * @returns {Promise<nodemailer.SentMessageInfo>}
     */
    milestoneNotifier(input: IMilestoneNotificationInput, user: any, notifier: IUserMilestoneNotifier): Promise<nodemailer.SentMessageInfo>;
    milestonesByTarget(target: string): Promise<IMilestoneDocument[]>;

}