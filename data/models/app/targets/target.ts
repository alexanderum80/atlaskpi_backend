import { ITarget, ITargetDocument, ITargetModel } from './ITarget';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as validate from 'validate.js';

let Schema = mongoose.Schema;

let TargetSchema = new Schema({
    datepicker: Date,   // 09/30/2017
    active: Boolean,    // true, false
    vary: String,       // fixed, increase, decrease
    amount: Number,     // 10
    amountBy: String,   // percent, fixed
    type: String,       // spline, dot
    period: String,     // last week, last month, last year
    notify: [String],   // [jfin@gmail.com, fzed@me.com]
    visible: [String],  // [jfin@gmail.com, fzed@me.com]
    delete: Boolean,    // true, false
    owner: String,      // username, determine if user allow to create
    target: Number,     // the target set to met
    chart: [{ type: mongoose.Schema.Types.String, ref: 'Chart'}]
});

TargetSchema.statics.createTarget = function(data: ITarget): Promise<ITargetDocument> {
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

        // set delete when user removes one
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
                let documentError = (<any>validate)( {
                    target: target },
                    { target: { prescence: { message: '^not found' }}});

                if (documentError) {
                    resolve(<any>{ success: false, errors: documentError, entity: null});
                    return;
                }

                if (data.notify) {
                    target.notify = [];
                }
                if (data.visible) {
                    target.visible = [];
                }

                for (let i in data) {
                    if (data[i]) {
                        target[i] = data[i];
                    }
                }

                target.save((err, target: ITarget) => {
                    if (err) {
                        reject({ success: false, entity: null, errors: err });
                        return;
                    }
                    resolve(<any>{ success: true, entity: target, errors: null });
                });

            }).catch((err) => {
                resolve(<any>{ success: false, entity: null, errors: err} );
            });
    });
};

TargetSchema.statics.removeTarget = function(id: string, authorized: boolean): Promise<ITargetDocument> {
    const that = this;
    return new Promise<ITargetDocument>((resolve, reject) => {
        if (authorized === true) {
            reject({ success: false, errors: [ {field: 'target', errors: ['Not authorized to remove role'] } ] });
            return;
        }

        (<ITargetModel>this).findById(id)
            .then((target) => {
                let documentError = (<any>validate)( {
                    target: target },
                    { target: { prescence: { message: '^not found' }}});

                if (documentError) {
                    resolve(<any>{ success: false, errors: documentError, entity: null});
                    return;
                }
                target.delete = true;
                let deleteTarget = target;
                target.save((err, target: ITargetDocument) => {
                    if (err) {
                        reject({ success: false, entity: null, errors: err });
                        return;
                    }
                    resolve(<any>{ success: true, entity: deleteTarget, errors: null });
                });
            }).catch((err) => {
                resolve(<any>{ success: false, entity: null, errors: err });
            });
    });
};

TargetSchema.statics.findTarget = function(id: string): Promise<ITargetDocument> {
    const that = this;
    return new Promise<ITargetDocument>((resolve, reject) => {
        (<ITargetModel>this).findById(id)
            .then((target) => {
                if (target) {
                    resolve(<any>{ success: true, errors: null, data: target });
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
                    resolve(<any>{ success: true, errors: null, data: targets });
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
