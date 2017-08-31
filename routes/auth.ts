import { getRequestHostname } from '../lib/utils/helpers';
import * as url from 'url';
import * as express from 'express';
import { Request, Response } from 'express';
import { AuthController } from '../controllers';
import { ExtendedRequest } from '../middlewares';
import { config } from '../config';

const auth = express.Router();

auth.post('/token', function authenticate(req: ExtendedRequest, res: Response) {
    let hostname = getRequestHostname(req);
    let authManager = new AuthController(req.masterContext.Account, req.appContext);
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    authManager.authenticateUser(hostname, req.body.username, req.body.password, ip, req.headers['user-agent'], req.headers['client-details'] )
        .then((tokenInfo) => {
            res.status(200).json(tokenInfo);
        }, (err) => {
            res.status(err.status || 401).json({ error: err.message });
        });
});

export { auth };
