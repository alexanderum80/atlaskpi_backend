import { ITarget, ITargetDocument, ITargetModel } from './ITarget';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as validate from 'validate.js';
import * as moment from 'moment';

let Schema = mongoose.Schema;

let NotifySchema = new Schema({
    users: [{ type: mongoose.Schema.Types.String, ref: 'User' }],
    notification: Date
});

let TargetSchema = new Schema({
    name: String,
    datepicker: Date,
    vary: String,
    amount: Number,
    amountBy: String,
    type: String,
    period: String,
    notify: NotifySchema,
    visible: [String],
    delete: Boolean,
    owner: String,
    target: Number,
    stackName: String,
    nonStackName: String,
    chart: [{ type: mongoose.Schema.Types.String, ref: 'Chart'}],
    timestamp: { type: Date, default: Date.now }
});

TargetSchema.statics.createTarget = function(data: ITarget): Promise<ITargetDocument> {
    const that = this;
    return new Promise<ITargetDocument>((resolve, reject) => {
        let constraints = {
            vary: { presence: {
                messsage: 'Vary cannot be empty' }
            },
            amount: { presence: {
                messsage: 'Amount cannot be empty' }
            }
        };
        let errors = (<any>validate)((<any>data), constraints, {fullMessages: false});
        if (errors) {
            reject({ success: false, message: 'Not permitted to add target', error: errors });
            return;
        }

        data.delete = false;

        that.create(data, (err, target: ITargetDocument) => {
            if (err) {
                reject({message: 'Not permitted to add target', error: err });
                return;
            }
            resolve(target);
        });

    });
};

TargetSchema.statics.updateTarget = function(id: string, data: ITarget): Promise<ITargetDocument> {
    const that = this;
    return new Promise<ITargetDocument>((resolve, reject) => {
        let constraints = {
            datepicker: { presence: {
                message: 'Datepicker cannot be empty' }
            },
            vary: { presence: {
                messsage: 'Vary cannot be empty' }
            },
            amount: { presence: {
                messsage: 'Amount cannot be empty' }
            }
        };
        let errors = (<any>validate)((<any>data), constraints, {fullMessages: false});
        if (errors) {
            reject({ success: false, message: 'Not permitted to add target', error: errors });
            return;
        }

        (<ITargetModel>this).findById(id)
            .then((target) => {
                if (data.visible) {
                    target.visible = [];
                }

                if (data.vary === 'fixed') {
                    data.period = '';
                }

                for (let i in data) {
                    if (i) {
                        target[i] = data[i];
                    }
                }

                target.save((err, target: ITargetDocument) => {
                    if (err) {
                        reject({ success: false, entity: null, errors: err });
                        return;
                    }
                    resolve(target);
                });

            }).catch((err) => {
                resolve(err);
            });
    });
};

TargetSchema.statics.removeTarget = function(id: string): Promise<ITargetDocument> {
    const that = this;
    return new Promise<ITargetDocument>((resolve, reject) => {
        (<ITargetModel>this).findById(id)
            .then((target) => {
                if (!target) { return; }
                target.delete = true;
                let deleteTarget = target;
                target.save((err, target: ITargetDocument) => {
                    if (err) {
                        reject({ success: false, entity: null, errors: err });
                        return;
                    }
                    resolve(target);
                });
            }).catch((err) => {
                resolve(err);
            });
    });
};

TargetSchema.statics.removeTargetFromChart = function(id: string): Promise<ITargetDocument> {
    const that = this;
    return new Promise<ITargetDocument>((resolve, reject) => {
        (<ITargetModel>this).findOne({ chart: { $in: [id] } })
            .then((target) => {
                if (!target) { return; } // raul added this line, sometimes there were no tarjet and it caused an exception
                target.delete = true;
                let deleteTarget = target;
                target.save((err, target: ITargetDocument) => {
                    if (err) {
                        reject({ success: false, entity: null, errors: err});
                        return;
                    }
                    resolve(target);
                });
            });
    });
};

TargetSchema.statics.findTarget = function(id: string): Promise<ITargetDocument[]> {
    const that = this;
    return new Promise<ITargetDocument[]>((resolve, reject) => {
      (<ITargetModel>this).find({_id: id, delete: 0})
            .then((target) => {
                if (target) {
                    resolve(target);
                    return;
                }
                resolve(<any>{ errors: [ { field: 'target', errors: ['Not found'] } ], data: null });
            }).catch((err) => {
                resolve(<any>{ errors: [ { field: 'target', errors: ['Not found'] } ], data: null });
            });
    });
};

TargetSchema.statics.findAllTargets = function(): Promise<ITargetDocument[]> {
    const that = this;
    return new Promise<ITargetDocument[]>((resolve, reject) => {
        (<ITargetModel>this).find()
            .then((targets) => {
                if (targets) {
                    resolve(targets);
                    return;
                }
                resolve(<any>{ errors: [ { field: 'target', errors: ['Not found'] } ], data: null });
            }).catch((err) => {
                resolve(<any>{ errors: [ { field: 'target', errors: ['Not found'] } ], data: null });
            });
    });
};

TargetSchema.statics.findUserVisibleTargets = function(chartId: string, userId: string): Promise<ITargetDocument[]> {
    const that = this;
    return new Promise<ITargetDocument[]>((resolve, reject) => {
        (<ITargetModel>this).find(
            { delete: 0, visible: { $in: [userId] },
              chart: { $in: [chartId] } }
        ).then((targets) => {
            if (targets) {
                resolve(targets);
                return;
            }
            resolve(<any>{ errors: [ { field: 'target', errors: ['Not found'] } ], data: null });
        }).catch((err) => {
            resolve(<any>{ errors: [ { field: 'target', errors: [err] } ], data: null });
        });
    });
};

export function getTargetModel(m: mongoose.Connection): ITargetModel {
    return <ITargetModel>m.model('Target', TargetSchema, 'targets');
}
