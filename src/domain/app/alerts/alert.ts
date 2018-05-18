import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';


export interface IAlertModelInfo {
    name: string;
    id: string;
}

export interface IAlertInfo {
    notifyUsers: string[];
    frequency: string;
    active: boolean;
    pushNotification: boolean;
    emailNotified: boolean;
    timezone: string;
    modelAlert: IAlertModelInfo;
    dayOfMonth: number;
    timestamp?: Date;
}

export interface IAlertDocument extends IAlertInfo, mongoose.Document {}

export interface IAlertModel extends mongoose.Model<IAlertDocument> {
    alertByWidgetId(model: string): Promise<IAlertDocument[]>;
    createAlert(input: IAlertInfo): Promise<IAlertDocument>;
    updateAlert(id: string, input: IAlertInfo): Promise<IAlertDocument>;
    updateAlertActiveField(id: string, active: boolean): Promise<IAlertDocument>;
    removeAlert(id: string): Promise<IAlertDocument>;
    removeAlertByModelId(id: string): Promise<IAlertDocument>;
    removeDeleteUser(id: string): Promise<IAlertDocument>;
}