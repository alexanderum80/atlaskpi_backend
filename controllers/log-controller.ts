import { IssueData } from '../services/notifications/app';
import { IIdentity } from '../data/models/app/identity';
import { TechnicalSupportIssueNotification, IssueLevelEnum, IssueLevelTable, getIssueLevelPropName } from '../services/notifications/app/technical-support-issue.notification';
import { ISupportEmailNotifier } from '../services/notifications';

import * as Promise from 'bluebird';
import * as logger from 'winston';
import * as moment from 'moment';
import { IAppModels } from '../data/models/app/app-models';
import connectToMongoDb from '../data/mongo-utils';
import { ILogEntry, ILogEntryModel, ILogEntryDocument, getLogModel } from '../data/models/app';
import { config } from '../config';

export interface ILogDetails {
    hostname: string;
    ip: string;
    timestamp: Date;
    clientId: string;
    clientDetails: string;

    level: number;
    message: string;
}

export class LogController {

    constructor(private _appContext: IAppModels) { }

    processLogEntry(details: ILogDetails): Promise<any> {

        const entryDetails: ILogEntry = {
            clientId: details.clientId,
            timestamp: details.timestamp,
            level: details.level,
            message: details.message
        };

        const emailDetails: IssueData = {
            timestamp: details.timestamp.toUTCString(),
            ip: details.ip,
            hostname: details.hostname,
            clientId: details.clientId,
            clientDetails: details.clientDetails,
            level: getIssueLevelPropName(IssueLevelTable[details.level]),
            message: details.message
        };

        const supportNotifier = new TechnicalSupportIssueNotification(config);

        return new Promise<any>((resolve, reject) => {
            let promises = [];

            // send emails
            promises.push(supportNotifier.notify(emailDetails));

            // send alerts

            // save to database;
            promises.push(this._saveLog(entryDetails));

            return Promise.all(promises)
                          .then(() => resolve())
                          .catch(err => reject(err));
        });
    }

    private _saveLog(entry: ILogEntry): Promise<ILogEntryDocument> {
        let that = this;

        return new Promise<ILogEntryDocument>((resolve, reject) => {
            that._appContext.LogModel.create(entry)
            .then((doc) => {
                logger.debug('log entry saved to database');
                resolve(doc);
            })
            .catch((err) => {
                logger.error('could not save the log entry... something went wrong');
                reject(err);
            });
        });
    }
}
