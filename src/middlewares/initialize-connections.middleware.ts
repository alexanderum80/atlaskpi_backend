import { AppConnectionPool } from './app-connection-pool';
import makeDefaultConnection from '../data/db-connector';
import { getRequestHostname } from '../lib/utils/helpers';
import { IAccountDocument } from '../data/models';
import { ExtendedRequest } from './extended-request';
import { Request, Response } from 'express';
import { getMasterContext, getContext, IIdentity } from '../data/models';
import * as logger from 'winston';
import * as mongoose from 'mongoose';

const appConnectionPool = new AppConnectionPool();

const graphqlOperationExceptions = [
    'AccountNameAvailable',
    'CreateAccount',
];

const loggerSuffix = '(MIDDLEWARE initializeContexts)';

export function initializeConmections(req: ExtendedRequest, res: Response, next) {

    makeDefaultConnection().then(defaultConnection => {
        req.masterConnection = mongoose.connection;
        const AccountModel = new AccountModel(mongoose.connection);

        getAppConnection(AccountModel, req, res, next).then(conn => {
            req.appConnection = conn;
        });
    });

    // })
    // .catch(err => {
    //     logger.error('There was an error getting the master context', err);
    //     next();
    // });
}

function getAppConnection(accountModel: AccountModel, req: ExtendedRequest, res: Response, next) {
    let hostname = getRequestHostname(req);
    logger.debug(`${loggerSuffix} Hostname: ${hostname}`);

    if ((!req.identity && !hostname) || graphqlOperationExceptions.indexOf(req.body.operationName) !== -1) {
        logger.debug(`${loggerSuffix} Not trying to create app connection because of the lack of identity, hostname or the operation is not part the exception list`);
        return next();
    }

    const accountName = (req.identity && req.identity.accountName) || hostname;

    if (!accountName) {
        logger.debug(`${loggerSuffix} No account name found: ${accountName}`);
        res.status(401).json('In order to create an app connection, an account name is needed either from the identity or from the hostname');
        return res.end();
    }

    logger.debug('creating app context for account name: ' + accountName);

    accountModel.findAccountByHostname(accountName).then((account: IAccountDocument) => {
        // I not always need to create a new connection I may be able to re-use an existent one
        if (!account) {
            logger.debug('account not found, ending the request...');
            res.status(404).json({ message: 'account not found.' });
            return res.end();
        }

        logger.debug(`${loggerSuffix} Account found`);

        appConnectionPool.getContext(account.getConnectionString()).then((ctx) => {
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

}