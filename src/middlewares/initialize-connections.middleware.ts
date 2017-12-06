import { config } from '../configuration/config';
import { Accounts, IAccountDocument } from '../domain/master/accounts';
import { AppConnectionPool } from './app-connection-pool';
import { ExtendedRequest } from './extended-request';
import { Request, Response } from 'express';
import * as logger from 'winston';
import * as mongoose from 'mongoose';
import { makeDefaultConnection } from '../helpers/mongodb.helpers';
import { MasterConnection, IAccountModel } from '../domain/index';
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
        // const masterConnection = new MasterConnection(req);
        // const accounts = new Accounts(masterConnection);
        const accounts = mongoose.model('Account', Accounts.Schema, 'accounts') as IAccountModel;

        getAppConnection(accounts, req, res, next).then(conn => {
            req.appConnection = conn;
            return next();
        })
        .catch(err => {
            logger.error('There was an error getting app connection', err);
            return res.status(500).end();
        });
    })
    .catch(err => {
        logger.error('There was an error getting the master connection', err);
        return res.status(500).end();
    });
}

function getAppConnection(accounts: IAccountModel, req: ExtendedRequest, res: Response, next): Promise<mongoose.Connection> {

    return new Promise<mongoose.Connection>((resolve, reject) => {
        let hostname = getRequestHostname(req);
        logger.debug(`${loggerSuffix} Hostname: ${hostname}`);
    
        if ((!req.identity && !hostname) || graphqlOperationExceptions.indexOf(req.body.operationName) !== -1) {
            logger.debug(`${loggerSuffix} Not trying to create app connection because of the lack of identity, hostname or the operation is not part the exception list`);
            return resolve(null);
        }
    
        const accountName = (req.identity && req.identity.accountName) || hostname;
    
        if (!accountName) {
            logger.debug(`${loggerSuffix} No account name found: ${accountName}`);
            return reject(`Account ${accountName} not found`);
        }
    
        logger.debug('creating app connection for account name: ' + accountName);
    
        accounts.findAccountByHostname(accountName).then((account: IAccountDocument) => {
            // I not always need to create a new connection I may be able to re-use an existent one
            if (!account) {
                logger.debug('account not found, ending the request...');
                return reject(`Account ${accountName} not found`);
            }
    
            logger.debug(`${loggerSuffix} Account found`);
    
            // TODO: I need to test this
            BRIDGE.container.get<AppConnectionPool>('AppConnectionPool').getConnection(account.getConnectionString()).then((appConn) => {
                // req.appConnection = appConn;
                logger.debug(`${loggerSuffix} App connection assigned to request`);
                resolve(appConn);
            })
            .catch(err => {
                logger.error('There was an error getting the app connection', err);
                return reject('There was an unexpected error. Our team its working on it');
            });
        })
        .catch(err => {
            logger.error('There was an error get account by hostname: ' + accountName, err);
            return reject('There was an unexpected error. Our team its working on it');
        });
    });
}