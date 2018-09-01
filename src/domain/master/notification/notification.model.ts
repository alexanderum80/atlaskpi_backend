import { inject, injectable } from 'inversify';
import { Schema } from 'mongoose';

import { ModelBase } from '../../../type-mongo/model-base';
import { MasterConnection } from '../master.connection';
import { INotificationModel } from './notification';

export const notificationSchema = new Schema({
    account: { type: String, required: true },
    addedBy: { type: String, required: true },
    deliveryMethod: { type: String, required: true },
    deliveryData: { type: String, required: true },
    message: { type: String, required: true },
    source: new Schema({
        type: { type: String, required: true },
        identifier: { type: String, required: true },
        timezone: { type: String, required: true },
    }),
    status: new Schema({
        name: { type: String, required: true },
        timestamp: { type: Date, required: true },
        details: { type: String },
    }),
    tries: { type: Number, required: true },
    type: { type: String, required: true },
    user: { type: String, required: true },
    log: [{
        name: { type: String, required: true },
        timestamp: { type: Date, required: true },
        details: { type: String },
    }],
});

@injectable()
export class Notifications extends ModelBase<INotificationModel> {
    static Schema = notificationSchema;

    constructor(@inject(MasterConnection.name) appConnection: MasterConnection) {
        super();
        this.initializeModel(appConnection.get, 'Notification', notificationSchema, 'notifications');
    }
}