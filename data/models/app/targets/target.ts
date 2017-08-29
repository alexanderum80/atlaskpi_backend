import { IRole, IRoleDocument, IRoleModel } from './ITarget';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as validate from 'validate.js';

let Schema = mongoose.Schema;

let RoleSchema = new Schema({
    datepicker: Date,   // 09/30/2017
    active: Boolean,    // true, false
    vary: String,       // fixed, increase, decrease
    amount: Number,     // 10
    amountBy: String,   // percent, fixed
    type: String,       // spline, dot
    period: String,     // last week, last month, last year
    notify: [String],   // [jfin@gmail.com, fzed@me.com]
    visible: [String],  // [jfin@gmail.com, fzed@me.com]
    chart: [{ type: mongoose.Schema.Types.String, ref: 'Chart'}]
});

RoleSchema.statics.createTarget = function(data: IRole): Promise<IRoleDocument> {
    const that = this;
    return new Promise<IRoleDocument>((resolve, reject) => {
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

        that.create(data, (err, role: IRoleDocument) => {
            if (err) {
                reject({message: 'Not permittedd to add target', error: err });
                return;
            }
            resolve(<any>{entity: role});
        });

    });
};

RoleSchema.statics.findRole = function(id: string): Promise<IRoleDocument> {
    const that = this;
    return new Promise<IRoleDocument>((resolve, reject) => {
        (<IRoleModel>this).findById(id)
            .then((role) => {
                if (role) {
                    resolve(<any>{ success: true, errors: null, data: role });
                    return;
                }
                resolve(<any>{ errors: [ { field: 'target', errors: ['Not found'] } ], data: null });
            }).catch((err) => {
                resolve(<any>{ errors: [ { field: 'target', errors: ['Not found'] } ], data: null });
            });
    });
};

RoleSchema.statics.findAllRoles = function(): Promise<IRoleDocument> {
    const that = this;
    return new Promise<IRoleDocument>((resolve, reject) => {
        (<IRoleModel>this).find()
            .then((roles) => {
                if (roles) {
                    resolve(<any>{ success: true, errors: null, data: roles });
                    return;
                }
                resolve(<any>{ errors: [ { field: 'target', errors: ['Not found'] } ], data: null });
            }).catch((err) => {
                resolve(<any>{ errors: [ { field: 'target', errors: ['Not found'] } ], data: null });
            });
    });
};