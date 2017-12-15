import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import { field } from '../../../framework/decorators/field.decorator';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { IAccessLogDocument, IAccessLogEntry, IAccessLogModel } from './access-log';

let Schema = mongoose.Schema;

let ResultSchema = {
    authorized: Schema.Types.Boolean,
    status: Schema.Types.Boolean,
    details: Schema.Types.String
};

let AccessLogSchema = new Schema({
    timestamp: Schema.Types.Date,
    accessBy: Schema.Types.String,
    ipAddress: Schema.Types.String,
    clientDetails: Schema.Types.String,
    eventType: Schema.Types.String,
    event: Schema.Types.String,
    payload: Schema.Types.String,
    result: ResultSchema
});

AccessLogSchema.statics.createLog = function(details: IAccessLogEntry): Promise < IMutationResponse > {
    const that = this;
    return new Promise((resolve, reject) => {
        that.create(details, (err, log: IAccessLogEntry) => {
            if (err) {
                reject({
                    message: 'Not permitted to add log',
                    error: err
                });
                return;
            }
            resolve({
                entity: log
            });
        });
    });

};

AccessLogSchema.statics.getAllAccessLogs = function(filter: string): Promise < IAccessLogDocument[] > {
    return new Promise < IAccessLogDocument[] > ((resolve, reject) => {
        ( < IAccessLogModel > this).find({})
            .then((accessLog) => {
                return resolve(accessLog);
            }).catch((err) => {
                reject({
                    errors: [{
                        field: 'accessLog',
                        errors: ['Not found']
                    }],
                    data: null
                });
            });
    });
};

@injectable()
export class AccessLogs extends ModelBase < IAccessLogModel > {
    constructor(@inject('AppConnection') appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'AccessLog', AccessLogSchema, 'accessLog');
    }
}