import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface INotify {
    users: string[];
    notification?: Date;
}

export interface ITarget {
    name: string;
    datepicker: string;
    active: boolean;
    vary: string;
    amount: number;
    amountBy: string;
    period: string;
    notify: INotify;
    visible: string[];
    owner: string;
    delete?: boolean;
    target?: number;
    nonStackName: string;
}

export interface ITargetDocument extends ITarget, mongoose.Document {}

export interface ITargetModel extends mongoose.Model<ITargetDocument> {
    findTarget(id: string): Promise<ITargetDocument>;
    findTargetById(id: string): Promise<ITargetDocument>;
    findTargetByName(name: string): Promise<ITargetDocument>;
    findTargetByDate(date: string): Promise<ITargetDocument[]>;
    findAllTargets(): Promise<ITargetDocument[]>;
    findUserVisibleTargets(chartId: string, userId: string): Promise<ITargetDocument[]>;
    createTarget(data: ITarget): Promise<ITargetDocument>;
    updateTarget(id: string, data: ITarget): Promise<ITargetDocument>;
    removeTarget(id: string): Promise<ITargetDocument>;
    removeTargetFromChart(id: string): Promise<ITargetDocument>;
}