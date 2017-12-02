import { Accounts, IAccountDocument } from '../domain/master/accounts';
import { AppConnectionPool } from './app-connection-pool';
import { ExtendedRequest } from './extended-request';
import { Request, Response } from 'express';
import * as logger from 'winston';
import * as mongoose from 'mongoose';
import { makeDefaultConnection } from '../helpers/mongodb.helpers';
import { config } from '../../config';
import { MasterConnection } from '../domain/index';
import { getRequestHostname } from '../helpers';
import { BRIDGE } from '../framework/index';

const graphqlOperationExceptions = [
    'AccountNameAvailable',
    'CreateAccount',
];

const loggerSuffix = '(MIDDLEWARE initialize connections)';

export function initializeConnections(req: ExtendedRequest, res: Response, next) {

    makeDefaultConnection(config).then(defaultConnection => {
        req.masterConnection = mongoose.connection;
        const masterConnection = new MasterConnection(req);
        const accounts = new Accounts(masterConnection);

        getAppConnection(accounts, req, res, next).then(conn => {
            req.appConnection = conn;
        });
    })
    .catch(err => {
        logger.error('There was an error getting the master connection', err);
        next();
    });
}

function getAppConnection(acounts: Accounts, req: ExtendedRequest, res: Response, next) {
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

    logger.debug('creating app connection for account name: ' + accountName);

    acounts.model.findAccountByHostname(accountName).then((account: IAccountDocument) => {
        // I not always need to create a new connection I may be able to re-use an existent one
        if (!account) {
            logger.debug('account not found, ending the request...');
            res.status(404).json({ message: 'account not found.' });
            return res.end();
        }

        logger.debug(`${loggerSuffix} Account found`);

        // TODO: I need to test this
        BRIDGE.container.get<AppConnectionPool>('AppConnectionPool').getConnection(account.getConnectionString()).then((appConn) => {
            req.appConnection = appConn;
            logger.debug(`${loggerSuffix} App connection assigned to request`);
            return next();
        })
        .catch(err => {
            logger.error('There was an error getting the app connection', err);
            return next();
        });
    })
    .catch(err => {
        logger.error('There was an error get account by hostname: ' + accountName, err);
        return next();
    });

}