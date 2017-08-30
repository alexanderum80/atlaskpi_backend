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
            logger.debug('creating app context for hostname: ' + hostname);

            ctx.Account.findAccountByHostname(hostname).then((account: IAccountDocument) => {
                // I not always need to create a new connection I may be able to re-use an existent one
                appContextPool.getContext(account.getConnectionString()).then((ctx) => {
                    req.appContext = ctx;
                    return next();
                })
                .catch(err => {
                    logger.error('There was an error getting the app context', err);
                    return next();
                });
            })
            .catch(err => {
                logger.error('There was an error get account by hostname: ' + hostname, err);
                return next();
            });
        } else {
            logger.debug('no app context will be created for this request');

            // request should not have and identity if it desn't have a hostname
            if (req.identity) {
                res.status(401).json('a hostname is needed for fullfilling this request');
                return res.end();
            }

            return next();
        }
    })
    .catch(err => {
        logger.error('There was an error getting the master context', err);
        next();
    });
}