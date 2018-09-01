import mongoose = require('mongoose');

export enum  NotificationTypeEnum {
    scheduledNotification = 'scheduleNotification',
}

export enum NotificationSourceEnum {
    widgetNotification = 'widgetNotification',
    targetNotification = 'targetNotification',
}

export enum DeliveryMethodEnum {
    push = 'push',
    email = 'email',
    sms = 'sms'
}

export enum INotificationStatusNameEnum {
    pending = 'pending',
    failed = 'fail',
    sent = 'sent'
}

export interface INotificationSource {
    type: NotificationSourceEnum;
    identifier: string;
    timezone: string;
}

export interface INotificationStatus {
    name: INotificationStatusNameEnum;
    timestamp: Date;
    details?: string;
}

export interface INewNotification {
    account: string;
    addedBy: string;
    deliveryMethod: DeliveryMethodEnum;
    deliveryData: any;
    message: string;
    source: INotificationSource;
    tries: number;
    type: NotificationTypeEnum;
    user: string;
}

export interface INotification {
    account: string;
    addedBy: string;
    deliveryMethod: DeliveryMethodEnum;
    deliveryData: any;
    message: string;
    source: INotificationSource;
    status: INotificationStatus;
    tries: number;
    type: NotificationTypeEnum;
    user: string;
    log?: INotificationStatus[];
}

// declare interface to mix account and mongo docuemnt properties/methods
export interface INotificationDocument extends INotification, mongoose.Document {
}

export interface INotificationModel extends mongoose.Model<INotificationDocument> {
}

