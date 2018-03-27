import { IAlert, IAlertDocument, IAlertInfo, IAlertModel } from './alert';
import { input } from '../../../framework/decorators/input.decorator';
import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';

import { inject, injectable } from 'inversify';
import { isArray } from 'lodash';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as validate from 'validate.js';
import * as moment from 'moment';

const Schema = mongoose.Schema;

const AlertInfoSchema = {
    notify: {
        type: [String],
        ref: 'User',
        required: true
    },
    frequency: { type: String, required: true },
    active: {type: Boolean, required: true},
    push_notification: Boolean,
    email_notified: Boolean,
    weekday: {
        type: String,
        default: moment().format('dddd')
    }
};

const AlertSchema = new Schema({
    alertInfo: [AlertInfoSchema],
    model_name: { type: String, required: true},
    model_id: { type: String, required: true }
});



AlertSchema.statics.alertByWidgetId = function(id: string): Promise<IAlertDocument> {
    const alertModel = (<IAlertModel>this);

    return new Promise<IAlertDocument>((resolve, reject) => {
        alertModel.findOne({ model_id: id })
            .then((result: IAlertDocument) => {
                resolve(result);
                return;
            })
            .catch(err => {
                reject(err);
                return;
            });
    });
};

AlertSchema.statics.createAlert = function(input: IAlertInfo): Promise<IAlertDocument> {
    const alertModel = (<IAlertModel>this);

    return new Promise<IAlertDocument>((resolve, reject) => {
        if (!input || !input.alertInfo || !input.alertInfo.length) {
            reject({ name: 'no data provided', message: 'no data provided' });
            return;
        }

        let hasNotification: boolean = true;
        // push_notification or email_notified must have value if active is true
        input.alertInfo.forEach((info: IAlert) => {
            if (info.active) {
                hasNotification = hasNotification && (info.push_notification || info.email_notified);
            }
        });

        if (!hasNotification) {
            reject({name: 'notification required', message: 'push notification or email notified must not be blank'});
            return;
        }

        alertModel.create(input)
            .then((result: IAlertDocument) => {
                resolve(result);
                return;
            })
            .catch(err => {
                reject(err);
                return;
            });
    });
};

AlertSchema.statics.updateAlert = function(id: string, input: IAlertInfo): Promise<IAlertDocument> {
    const alertModel = (<IAlertModel>this);

    return new Promise<IAlertDocument>((resolve, reject) => {
        if (!id) {
            reject({ name: 'no id', message: 'no id has been provided' });
        }
        if (!input || !input.alertInfo || !input.alertInfo.length) {
            reject({ name: 'no data provided', message: 'no data provided' });
            return;
        }

        let hasNotification: boolean = true;
        // push_notification or email_notified must have value if active is true
        input.alertInfo.forEach((info: IAlert) => {
            if (info.active) {
                hasNotification = hasNotification && (info.push_notification || info.email_notified);
            }
        });

        if (!hasNotification) {
            reject({name: 'notification required', message: 'push notification or email notified must not be blank'});
            return;
        }

        alertModel.findByIdAndUpdate(id, input)
            .then((result: IAlertDocument) => {
                resolve(result);
                return;
            })
            .catch(err => {
                reject(err);
                return;
            });
    });
};

AlertSchema.statics.removeAlertByModelId = function(id: string): Promise<IAlertDocument> {
    const alertModel = (<IAlertModel>this);

    return new Promise<IAlertDocument>((resolve, reject) => {
        if (!id) {
            reject({ name: 'no id', message: 'no id provided' });
            return;
        }

        alertModel.findOne({ model_id: id }).then((alert: IAlertDocument) => {
            if (!alert) {
                resolve(null);
                return;
            }

            alert.remove((err: any, deletedAlert: IAlertDocument) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(alert);
                return;
            });
        });
    });
};


@injectable()
export class Alerts extends ModelBase <IAlertModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Alert', AlertSchema, 'alerts');
    }
}
