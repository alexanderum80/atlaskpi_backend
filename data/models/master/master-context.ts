import { getZipToMapModel } from './zip-to-map/zip-to-map';
import { getCountryModel, getStateModel } from './countries';
import { getConnectorModel } from './connectors/connector-schema';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as winston from 'winston';
import { IMasterModels } from './master-models';
import makeDefaultConnection from '../../db-connector';
import { getAccountModel } from './accounts';
import { getIndustryModel } from './industries';

let masterModels: IMasterModels = null;

export function getMasterContext(): Promise<IMasterModels> {
    winston.debug(`Getting master context`);

    return new Promise<IMasterModels>((resolve, reject) => {
        if (masterModels !== null && masterModels.Connection.readyState === 1) {
            resolve(masterModels);
            return;
        }

        makeDefaultConnection().then(() => {
            masterModels = {
                Connection: mongoose.connection,
                Connector: getConnectorModel(),
                Account: getAccountModel(),
                Industry: getIndustryModel(),
                Country: getCountryModel(),
                State: getStateModel(),
                ZipToMap: getZipToMapModel()
            };

            resolve(masterModels);
        }, (err) => {
            winston.error('Error connecting to master database', err);
        });
    });
}
