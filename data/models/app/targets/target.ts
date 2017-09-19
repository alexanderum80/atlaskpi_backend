import { ITarget, ITargetDocument, ITargetModel } from './ITarget';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as validate from 'validate.js';

let Schema = mongoose.Schema;

let TargetSchema = new Schema({
    name: String,
    datepicker: Date,
    active: Boolean,
    vary: String,
    amount: Number,
    amountBy: String,
    type: String,
    period: String,
    notify: [String],
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
            active: { presence: {
                message: 'Active/Inactive cannot be empty' }
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

TargetSchema.statics.updateTarget = function(id: string, data: ITarget, username: string): Promise<ITargetDocument> {
    const that = this;
    return new Promise<ITargetDocument>((resolve, reject) => {
        let constraints = {
            datepicker: { presence: {
                message: 'Datepicker cannot be empty' }
            },
            active: { presence: {
                message: 'Active/Inactive cannot be empty' }
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
                if (target.owner !== username) {
                    reject({ success: false, entity: null, errors: 'Not authorized to update target'});
                    return;
                }

                if (data.notify) {
                    target.notify = [];
                }
                if (data.visible) {
                    target.visible = [];
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

TargetSchema.statics.removeTarget = function(id: string, username: string): Promise<ITargetDocument> {
    const that = this;
    return new Promise<ITargetDocument>((resolve, reject) => {
        (<ITargetModel>this).findById(id)
            .then((target) => {
                if (target.owner !== username) {
                    reject({ success: false, entity: null, errors: 'Not authorized to remove target'});
                    return;
                }
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

export function getTargetModel(m: mongoose.Connection): ITargetModel {
    return <ITargetModel>m.model('Target', TargetSchema, 'targets');
}
