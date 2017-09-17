import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface ITarget {
    name: string;
    datepicker: string;
    active: boolean;
    vary: string;
    amount: number;
    amountBy: string;
    period: string;
    notify: string[];
    visible: string[];
    delete?: boolean;
    owner: string;
}

export interface ITargetDocument extends ITarget, mongoose.Document {}

export interface ITargetModel extends mongoose.Model<ITargetDocument> {
    findTarget(id: string): Promise<ITargetDocument>;
    findAllTargets(): Promise<ITargetDocument[]>;
    createTarget(data: ITarget): Promise<ITargetDocument>;
    updateTarget(id: string, data: ITarget): Promise<ITargetDocument>;
    removeTarget(id: string, username: string): Promise<ITargetDocument>;
}