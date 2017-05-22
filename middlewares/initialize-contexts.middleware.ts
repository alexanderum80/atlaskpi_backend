import { IAccountDocument } from '../data/models';
import { ExtendedRequest } from './extended-request';
import { Request, Response } from 'express';
import { getMasterContext, getContext, IIdentity } from '../data/models';
import * as logger from 'winston';

export function initializeContexts(req: ExtendedRequest, res: Response, next) {
    getMasterContext().then((ctx) => {
        req.masterContext = ctx;

        // try to create the app context based on the identity or the hostname
        let hostname = _getHostname(req);

        // using identity
        if (req.identity) {
            logger.debug('creating app context from user identity');
            let identity = <IIdentity>req.identity;
            getContext(<string>identity.dbUri).then((ctx) => {
                req.appContext = ctx;
                next();
            });
        }
        // using hostname 
        else if (hostname) {
            logger.debug('creating app context from user hostname');

            ctx.Account.find((err, res) => {
                let a = res;
            });

            ctx.Account.findAccountByHostname(hostname).then((account: IAccountDocument) => {
                getContext(account.getConnectionString()).then((ctx) => {
                    req.appContext = ctx;
                    next();
                });
            });
        } else {
            logger.debug('no app context will be created for this request');
            next();
        }
    });
}

function _getHostname(req: ExtendedRequest): String {
    //  just for testing
    // return 'customer2.kpibi.com';

    // check host value from body
    let hostname: String = req.body.host || req.hostname || req.subdomain;

    // stop if not host have been passed
    if (!hostname)
        return null;

    let hostTokens = hostname.split('.');

    // make sure that we have at least 4 tokens, otherwise there is not a subdomain
    return hostTokens.length !== 4 ? null : hostname;
}