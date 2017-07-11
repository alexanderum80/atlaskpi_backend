
import * as Promise from 'bluebird';
import * as logger from 'winston';
import * as moment from 'moment';
import { IAppModels } from '../data/models/app/app-models';
import connectToMongoDb from '../data/mongo-utils';
import { ILogEntry, ILogEntryModel, ILogEntryDocument, getLogModel } from '../data/models/app';

export class LogController {

    constructor(private _appContext: IAppModels) { }

    processLogEntry(clientId: string, timestamp: Date, level: number, message: string): Promise<any> {

        let entryDetails: ILogEntry = {
            clientId: clientId,
            timestamp: timestamp,
            level: level,
            message: message
        };

        return new Promise<any>((resolve, reject) => {
            // send emails

            // send alerts 

            // save to database;
            this.save(entryDetails)
            .then(() =>
                Promise.resolve())
            .catch(() => Promise.reject);
        });
    }

    private save(entry: ILogEntry): Promise<ILogEntryDocument> {
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
