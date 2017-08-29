import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface IRole {
    datepicker: Date;
    active: boolean;
    vary: string;
    amount: number;
    amountBy: string;
    period: string;
    notify: string[];
    visible: string[];
}

export interface IRoleDocument extends IRole, mongoose.Document {}

export interface IRoleModel extends mongoose.Model<IRoleDocument> {
    findTarget(id: string): Promise<IRoleDocument>;
    findAllTargets(id: string): Promise<IRoleDocument[]>;
    createTarget(data: IRole): Promise<IRoleDocument>;
}