import { Winston } from 'winston';
import { ILogEntry } from '../domain/app/log';
import { injectable, inject } from 'inversify';
import { TechnicalSupportIssueNotification } from '../services/notifications/app/index';
import { ILogEntryDocument, Logs } from '../domain/index';

export interface ILogDetails {
    timestamp: Date;
    hostname: string;
    ip: string;
    clientId: string;
    clientDetails: string;
    level: number;
    message: string;
}

@injectable()
export class LogController {

    constructor(
        @inject('TechnicalSupportIssueNotification') private _supportNotifier: TechnicalSupportIssueNotification,
        @inject('Logs') private _logs: Logs,
        @inject('logger') private _logger: Winston) { }

    processLogEntry(details: ILogDetails): Promise<any> {
        const that = this;

        return new Promise<any>((resolve, reject) => {
            let promises = [];

            // send emails
            promises.push(that._supportNotifier.notify(details));

            // send alerts

            // save to database;
            promises.push(this._saveLog(details));

            return Promise.all(promises)
                          .then(() => resolve())
                          .catch(err => reject(err));
        });
    }

    private _saveLog(entry: ILogEntry): Promise<ILogEntryDocument> {
        let that = this;

        return new Promise<ILogEntryDocument>((resolve, reject) => {
            that._logs.model.create(entry)
            .then((doc) => {
                that._logger.debug('log entry saved to database');
                resolve(doc);
            })
            .catch((err) => {
                that._logger.error('could not save the log entry... something went wrong');
                reject(err);
            });
        });
    }
}
