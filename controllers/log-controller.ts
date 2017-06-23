
import * as Promise from 'bluebird';
import * as winston from 'winston';
import * as moment from 'moment';
import { IAppModels } from '../data/models/app/app-models';
import connectToMongoDb from '../data/mongo-utils';
import { ILogEntry, ILogEntryModel, ILogEntryDocument, getLogModel } from '../data/models/app';

export class LogController {

    constructor(private _appContext: IAppModels) { }

    createLog(clientId, level, message): Promise<ILogEntryDocument> {
        let that = this;

        let entryDetails: ILogEntry = {
            clientId: clientId,
            level: level,
            message: message
        };

        return new Promise<ILogEntryDocument>((resolve, reject) => {
            that._appContext.LogModel.createEntry(entryDetails).then((doc) => {
                resolve(doc);
            })
            .catch((err) => reject(err));
        });
    }
}
