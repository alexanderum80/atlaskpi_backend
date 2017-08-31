import { ExtendedRequest } from '../../middlewares';
import { config } from '../../config';

export function getRequestHostname(req: ExtendedRequest): string {
    //  just for testing
    if (config.impersonateHost)
        return config.impersonateHost;

    // check host value from body
    let hostname: string = req.body.host || req.hostname;

    // stop if not host have been passed
    if (!hostname)
        return null;

    // let hostUri = url.parse(companySubdomain);

    let hostTokens = hostname.split('.');

    // make sure that we have at least 4 tokens, otherwise there is not a subdomain
    return hostTokens.length !== 4 ? null : hostname;
}