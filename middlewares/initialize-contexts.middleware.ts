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

export function initializeContexts(req: ExtendedRequest, res: Response, next) {

    getMasterContext().then((ctx) => {
        req.masterContext = ctx;

        // try to create the app context based on the identity or the hostname
        let hostname = getRequestHostname(req);

        // using hostname
        if (hostname) {
            logger.debug('creating app context from user hostname');

            ctx.Account.findAccountByHostname(hostname).then((account: IAccountDocument) => {
                // I not always need to create a new connection I may be able to re-use an existent one
                appContextPool.getContext(account.getConnectionString()).then((ctx) => {
                    req.appContext = ctx;
                    next();
                })
                .catch(err => {
                    logger.error('There was an error getting the app context', err);
                    next();
                });
            })
            .catch(err => {
                logger.error('There was an error get account by hostname: ' + hostname, err);
                next();
            });
        } else {
            logger.debug('no app context will be created for this request');
            next();
        }
    })
    .catch(err => {
        logger.error('There was an error getting the master context', err);
        next();
    });
}