import { ExtendedRequest } from '../../middlewares';
import { config } from '../../config';
import * as logger from 'winston';

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
    let hostname: string = req.body.host || req.hostname;

    // sometimes the hostname is localhost, in that case let's get the gostname from the headers
    if (hostname === 'localhost') {
        hostname = req.headers['x-hostname'];
    }

    logger.debug(`${loggerSuffix} Using the following hostname: ${hostname}`);

    // stop if not host have been passed
    if (!hostname)
        return null;

    // let hostUri = url.parse(companySubdomain);

    let hostTokens = hostname.split('.');

    // make sure that we have at least 4 tokens, otherwise there is not a subdomain
    return hostTokens.length !== 4 ? null : hostname;
}