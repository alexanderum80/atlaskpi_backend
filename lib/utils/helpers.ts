import { ExtendedRequest } from '../../middlewares';
import { config } from '../../config';
import * as logger from 'winston';
import { isArray, isObject } from 'lodash';

const loggerSuffix = '(FUNCTION getRequestHostname)';

export function getRequestHostname(req: ExtendedRequest): string {
    //  just for testing
    if (config.impersonateHost) {
        logger.debug(`${loggerSuffix} Using impersonateHost: ${config.impersonateHost}`);
        return config.impersonateHost;
    }

    const rawHostname = {
        'body.host': req.body.host,
        'req.hostname': req.hostname,
        'x-hostname': req.headers['x-hostname']
    };

    logger.debug(`${loggerSuffix} Posible hostname sources: ${JSON.stringify(rawHostname)}`);

    // check host value from body
    let hostname: string = req.body.host || req.headers['x-hostname'] || req.hostname;

    logger.debug(`${loggerSuffix} Using the following hostname: ${hostname}`);

    // stop if not host have been passed
    if (!hostname)
        return null;

    // let hostUri = url.parse(companySubdomain);

    let hostTokens = hostname.split('.');

    // make sure that we have at least 4 tokens, otherwise there is not a subdomain
    return hostTokens.length !== 4 ? null : hostname;
}


export function isRexExp(value: any): boolean {
    return value instanceof RegExp;
}

export function isArrayOnly(arr: any[]): boolean {
    return (isArray(arr)) && ( arr.findIndex((val) => isObject(val)) ) === -1;
}

export function isArrayObject(arr: any[]): boolean {
    return (isArray(arr)) && ( arr.findIndex((val) => isObject(val)) ) !== -1;
}