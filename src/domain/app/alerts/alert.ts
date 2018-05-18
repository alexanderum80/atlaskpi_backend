import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';


export interface IAlertModelInfo {
    name: string;
    id: string;
}

export interface IAlertInfo {
    notify_users: string[];
    frequency: string;
    active: boolean;
    push_notification: boolean;
    email_notified: boolean;
    timezone: string;
    model_alert: IAlertModelInfo;
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