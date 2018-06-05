import { IAlertDocument, IAlertInfo, IAlertModel } from './alert';
import { input } from '../../../framework/decorators/input.decorator';
import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';

import { inject, injectable } from 'inversify';
import { isArray, isEqual, isBoolean, isEmpty } from 'lodash';
import * as mongoose from 'mongoose';
import * as BlueBird from 'bluebird';
import * as validate from 'validate.js';
import * as moment from 'moment';

const Schema = mongoose.Schema;

const AlertModelInfoSchema = {
    name: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
};

const AlertSchema = new Schema({
    notifyUsers: [{
        // type: Schema.Types.String,
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    // i.e. every business day
    frequency: { type: String, required: true },
    // alert is active or inactive
    active: {type: Boolean, required: true},
    pushNotification: Boolean,
    emailNotified: Boolean,
    modelAlert: {
        type: AlertModelInfoSchema,
        required: true
    },
    dayOfMonth: {
        type: Number,
        required: true,
        default: parseInt(moment().format('DD'))
    },
    timestamp: {
        type: Date,
        default: Date.now()
    }
});



AlertSchema.statics.alertByWidgetId = function(id: string): BlueBird<IAlertDocument[]> {
    const alertModel = (<IAlertModel>this);

    return new BlueBird<IAlertDocument[]>((resolve, reject) => {
        alertModel.find({ 'modelAlert.id': id })
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
                reject({ name: 'no alert found', message: 'no alert found' });
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

        alertModel.findOne({ 'modelAlert.id': id }).then((alert: IAlertDocument) => {
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
                'notifyUsers': {
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
export class Alerts extends ModelBase <IAlertModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Alert', AlertSchema, 'alerts');
    }
}
