import { IQueryResponse } from '../../common';
import { IAccessLogDocument, IAccessModel } from './IAccessLog';
import { IMutationResponse } from '../../common';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { IAccessLogEntry } from './';

let Schema = mongoose.Schema;

let ResultSchema = new Schema({
    authorized: Boolean,
    status: Boolean,
    details: String
});

let AccessLogSchema = new Schema({
    timestamp: Date,
    accessBy: String,
    ipAddress: String,
    clientDetails: String,
    eventType: String,
    event: String,
    payload: String,
    results: ResultSchema
});

AccessLogSchema.statics.createLog = function(details: IAccessLogEntry): Promise<IMutationResponse> {
    const that = this;
    return new Promise((resolve, reject) => {
        that.create(details, (err, log: IAccessLogEntry) => {
            if (err) {
                reject({message: 'Not permitted to add log', error: err});
                return;
            }
            resolve({entity: log});
        });
    });

};

AccessLogSchema.statics.getAllAccessLogs = function(filter: string): Promise<IQueryResponse<IAccessLogDocument>> {
    return new Promise<IQueryResponse<IAccessLogDocument>>((resolve, reject) => {
        (<IAccessModel>this).find({})
            .then((accessLog) => {
                if (accessLog) {
                    resolve({ errors: null, data: accessLog });
                    return;
                }
                resolve({ errors: [ {field: 'accessLog', errors: ['Not found'] } ], data: null });
            }).catch((err) => {
                resolve({ errors: [ {field: 'accessLog', errors: ['Not found'] } ], data: null });
            });
    });
};

export function getAccessLogModel(m: mongoose.Connection): IAccessModel {
    return <IAccessModel>m.model('AccessLog', AccessLogSchema, 'accessLog');
}