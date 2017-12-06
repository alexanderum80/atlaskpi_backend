import { Request } from 'Express';
import * as logger from 'winston';
import { config } from '../configuration/index';

const loggerSuffix = '(FUNCTION getRequestHostname)';

export function getRequestHostname(req: Request): string {
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