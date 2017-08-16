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

    // let closeAppContext = function() {
    //     if (req.appContext) {
    //         if (req.appContext.Connection.readyState === 1) {
    //             req.appContext.Connection.close();
    //         }
    //     }
    // };

    // res.once('finish', closeAppContext);
    // res.once('close', closeAppContext);

    getMasterContext().then((ctx) => {
        req.masterContext = ctx;

        // try to create the app context based on the identity or the hostname
        let hostname = _getHostname(req);

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

export function _getHostname(req: ExtendedRequest): string {
    //  just for testing
    // return 'customer2.kpibi.com';

    // check host value from body
    // let hostname: string = req.body.host || req.hostname || req.subdomain;

    let hostname = req.headers['x-hostname'] || req.body.host || req.hostname || req.subdomain;

    // stop if not host have been passed
    if (!hostname)
        return null;

    let hostTokens = hostname.split('.');

    // make sure that we have at least 4 tokens, otherwise there is not a subdomain
    return hostTokens.length !== 4 ? null : hostname;
}