import * as Promise from 'bluebird';
import * as winston from 'winston';
import { IMasterModels } from './master-models';
import makeDefaultConnection from '../../nova-connector';
import { getAccountModel } from './Account';

let mastertModels: IMasterModels = null;

export function getMasterContext(): Promise<IMasterModels> {
    winston.debug(`Getting master context`);

    return new Promise<IMasterModels>((resolve, reject) => {
        if (mastertModels !== null) {
            resolve(mastertModels);
            return;
        }

        makeDefaultConnection().then(() => {
            mastertModels = {
                Account: getAccountModel(),
            };

            resolve(mastertModels);
        }, (err) => {
            winston.error('Error connecting to master database', err);
        })
    });
}