import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface INotificationUsers {
    user: String[];
    byEmail: Boolean;
    byPhone: Boolean;
}
export interface IAlert {
    // _id: string;
    name: String;
    kpi: String;
    frequency: String;
    condition: String;
    value: Number;
    notificationUsers: INotificationUsers[];
    active: Boolean;
}

export interface IAlertModelInfo {
    name: string;
    id: string;
}

export interface IAlertInfo {
    name: String;
    kpi: String;
    frequency: String;
    condition: String;
    value: Number;
    notificationUsers: INotificationUsers[];
    active: Boolean;
}

export interface IAlertDocument extends IAlert, mongoose.Document {

}

export interface IAlertModel extends mongoose.Model<IAlertDocument> {
    alertByWidgetId(model: string): Promise<IAlertDocument[]>;
    getAlerts(): Promise<IAlertDocument[]>;
    createAlert(input: IAlertInfo): Promise<IAlertDocument>;
    updateAlert(id: string, input: IAlertInfo): Promise<IAlertDocument>;
    updateAlertActive(id: string, active: boolean): Promise<IAlertDocument>;
    removeAlert(id: string): Promise<IAlertDocument>;
    removeAlertByModelId(id: string): Promise<IAlertDocument>;
    removeDeleteUser(id: string): Promise<IAlertDocument>;
}
