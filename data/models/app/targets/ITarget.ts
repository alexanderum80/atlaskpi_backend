import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface INotify {
    notifyDigit: number;
    notifyTime: string;
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
    notify: INotify[];
    visible: string[];
    delete?: boolean;
    owner: string;
}

export interface ITargetDocument extends ITarget, mongoose.Document {}

export interface ITargetModel extends mongoose.Model<ITargetDocument> {
    findTarget(id: string): Promise<ITargetDocument>;
    findAllTargets(): Promise<ITargetDocument[]>;
    findUserVisibleTargets(chartId: string, userId: string): Promise<ITargetDocument[]>;
    createTarget(data: ITarget): Promise<ITargetDocument>;
    updateTarget(id: string, data: ITarget): Promise<ITargetDocument>;
    removeTarget(id: string): Promise<ITargetDocument>;
    removeTargetFromChart(id: string): Promise<ITargetDocument>;
}