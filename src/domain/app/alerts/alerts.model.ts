import { isEmpty, isBoolean } from 'lodash';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as BlueBird from 'bluebird';
import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { IAlertDocument, IAlertInfo, IAlertModel } from './alerts';

const ALERT_USER_SCHEMA = new mongoose.Schema({
    identifier: { type: String, required: true },
    deliveryMethods: { type: [String], enum: ['email', 'push'], required: true }
});

export const AlertSchema = new mongoose.Schema({
    name: { type: String, required: true },
    kpi: { type: String, required: true },
    frequency: { type: String, required: true },
    condition: { type: String, required: true },
    value: { type: Number, required: true },
    active: { type: Boolean, required: true },
    users: { type: [ALERT_USER_SCHEMA], required: true },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, required: true }
});

AlertSchema.statics.alertsbyWidgetId = function(id: string): BlueBird<IAlertDocument[]> {
    const alertModel = (<IAlertModel>this);

    return new BlueBird<IAlertDocument[]>((resolve, reject) => {
        alertModel.find({ 'alertModel.id': id })
            .then((result: IAlertDocument[]) => {
                resolve(result);
                return;
            })
            .catch(err => {
                reject(err);
                return;
            });
    });
};

AlertSchema.statics.createAlert = function(input: IAlertInfo): BlueBird<IAlertDocument> {
    const alertModel = (<IAlertModel>this);

    return new BlueBird<IAlertDocument>((resolve, reject) => {
        if (!input || isEmpty(input)) {
            reject({ name: 'no data provided', message: 'no data provided' });
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

AlertSchema.statics.updateAlert = function(id: string, input: IAlertInfo): BlueBird<IAlertDocument> {
    const alertModel = (<IAlertModel>this);

    return new BlueBird<IAlertDocument>((resolve, reject) => {
        if (!id) {
            reject({ name: 'no id', message: 'no id has been provided' });
        }
        if (!input || isEmpty(input)) {
            reject({ name: 'no data provided', message: 'no data provided' });
            return;
        }

        alertModel.findByIdAndUpdate(id, input).then((alert: IAlertDocument) => {
            resolve(alert);
            return;
        })
        .catch(err => {
            reject(err);
            return;
        });
    });
};

AlertSchema.statics.updateAlertActiveField = function(id: string, active: boolean): BlueBird<IAlertDocument> {
    const alertModel = (<IAlertModel>this);

    return new BlueBird<IAlertDocument>((resolve, reject) => {
        if (!isBoolean(active)) {
            reject({ name: 'no active value', message: 'no active provided'});
            return;
        }

        if (!id) {
            reject({ name: 'no id', message: 'no id provided'});
            return;
        }

        alertModel.findById(id).then(alert => {
            if (alert) {
                alert.active = active;
                alert.save((err, alert: IAlertDocument) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(alert);
                    return;
                });
            }
        }).catch(err => {
            reject(err);
        });
    });
};

AlertSchema.statics.removeAlert = function(id: string): BlueBird<IAlertDocument> {
    const alertModel = (<IAlertModel>this);

    return new BlueBird<IAlertDocument>((resolve, reject) => {
        if (!id) {
            reject({ name: 'no id', message: 'no id provided' });
        }

        alertModel.findById(id).then((alert: IAlertDocument) => {
            if (!alert) {
                reject({ name: 'no Alert found', message: 'no Alert found' });
                return;
            }

            alert.remove((err, deletedAlert) => {
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

AlertSchema.statics.removeAlertByModelId = function(id: string): BlueBird<IAlertDocument> {
    const alertModel = (<IAlertModel>this);

    return new BlueBird<IAlertDocument>((resolve, reject) => {
        if (!id) {
            reject({ name: 'no id', message: 'no id provided' });
            return;
        }

        alertModel.findOne({ 'alertModel.id': id }).then((alert: IAlertDocument) => {
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
        }).catch(err => {
            reject(err);
        });
    });
};

AlertSchema.statics.removeDeleteUser = async function(id: string): Promise<boolean> {
    const alertModel = (<IAlertModel>this);
    try {
        const removeUser = await this.update(
            {}, {
                'users.identifier': {
                    $in: [id]
                }
            }, {
                multi: true
            }).exec();

        return removeUser;
    } catch (err) {
        return err;
    }
};

@injectable()
export class Alerts extends ModelBase<IAlertModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Alerts', AlertSchema, 'alerts');
    }
}
