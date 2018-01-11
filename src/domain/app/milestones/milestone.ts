// import { IUserMilestoneNotifier } from '../../../../services';
import { IEmployee } from '../employees/employee';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as nodemailer from 'nodemailer';

export interface IMilestone {
    target: string;
    task: string;
    dueDate: string;
    status: string;
    responsible: [IEmployee];
}

export interface IMilestoneDocument extends IMilestone, mongoose.Document {

}

export interface IMilestoneModel extends mongoose.Model<IMilestoneDocument> {
    createMilestone(target: string, task: string, dueDate: string, status: string, responsible?: string[]): Promise<IMilestoneDocument>;
    updateMilestone(_id: string, target: string, task: string, dueDate: string, status: string, responsible?: string[]): Promise<IMilestoneDocument>;
    deleteMilestone(_id: string): Promise<IMilestoneDocument>;
    updateMilestoneStatus(_id: string): Promise<IMilestoneDocument>;
    /**
     * Request a user milestone notification email.
     * @param {string} email - user's email address
     * @returns {Promise<nodemailer.SentMessageInfo>}
     */
    milestoneNotifier(email: string, notifier: any /*IUserMilestoneNotifier*/): Promise<nodemailer.SentMessageInfo>;
}