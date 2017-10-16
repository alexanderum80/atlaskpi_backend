import { getRequestHostname } from '../lib/utils/helpers';
import { AppContextPool } from './app-context-pool';
import { IAppModels } from '../data/models/app/app-models';
import { IAccountDocument } from '../data/models';
import { ExtendedRequest } from './extended-request';
import { Request, Response } from 'express';
import { getMasterContext, getContext, IIdentity } from '../data/models';
import * as logger from 'winston';
import * as mongoose from 'mongoose';

const appContextPool = new AppContextPool();

const graphqlOperationExceptions = [
    'AccountNameAvailable',
    'CreateAccount',
];

const loggerSuffix = '(MIDDLEWARE initializeContexts)';

export function initializeContexts(req: ExtendedRequest, res: Response, next) {

    getMasterContext().then((ctx) => {
        req.masterContext = ctx;

        // try to create the app context based on the identity or the hostname
        // only initialize contexts when we have identity
        let hostname = getRequestHostname(req);
        logger.debug(`${loggerSuffix} Hostname: ${hostname}`);

        if ((!req.identity && !hostname) || graphqlOperationExceptions.indexOf(req.body.operationName) !== -1) {
            logger.debug(`${loggerSuffix} Not trying to create app context because of the lack of identity, hostname or the operation is not part the exception list`);
            return next();
        }

        const accountName = (req.identity && req.identity.accountName) || hostname;

        if (!accountName) {
            logger.debug(`${loggerSuffix} No account name found: ${accountName}`);
            res.status(401).json('An account name is needed either from the identity or from the hostname');
            return res.end();
        }

        logger.debug('creating app context for account name: ' + accountName);

        ctx.Account.findAccountByHostname(accountName).then((account: IAccountDocument) => {
            // I not always need to create a new connection I may be able to re-use an existent one
            if (!account) {
                logger.debug('account not found, ending the request...');
                res.status(404).json({ message: 'account not found.' });
                return res.end();
            }

            logger.debug(`${loggerSuffix} Account found`);
            appContextPool.getContext(account.getConnectionString()).then((ctx) => {
                req.appContext = ctx;
                logger.debug(`${loggerSuffix} App context assigned to request`);
                return next();
            })
            .catch(err => {
                logger.error('There was an error getting the app context', err);
                return next();
            });
        })
        .catch(err => {
            logger.error('There was an error get account by hostname: ' + accountName, err);
            return next();
        });

        // } else {
        //     logger.debug('no app context will be created for this request');

        //     // request should not have and identity if it desn't have a hostname
        //     if (req.identity) {
        //         res.status(401).json('a hostname is needed for fullfilling this request');
        //         return res.end();
        //     }

        //     return next();
        // }
    })
    .catch(err => {
        logger.error('There was an error getting the master context', err);
        next();
    });
}