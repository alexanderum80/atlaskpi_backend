import * as url from 'url';
import * as express from 'express';
import { Request, Response } from 'express';
import { AuthController } from '../controllers';
import { ExtendedRequest } from '../middlewares';

const auth = express.Router();

auth.post('/token', function authenticate(req: ExtendedRequest, res: Response) {
    let hostname = _getHostname(req);

    let authManager = new AuthController(req.masterContext.Account, req.appContext);
    authManager.authenticateUser(hostname, req.body.username, req.body.password)
        .then((tokenInfo) => {
            res.status(200).json(tokenInfo);
        }, (err) => {
            res.status(err.status || 401).json({ error: err.message });
        });
});

function _getHostname(req: Request): string {
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

export { auth };
