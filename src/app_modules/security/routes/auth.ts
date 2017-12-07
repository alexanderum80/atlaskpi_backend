import { BRIDGE } from '../../../framework/decorators';
import * as url from 'url';
import * as express from 'express';
import { Request, Response } from 'express';
import { getRequestHostname } from '../../../helpers/index';
import { IExtendedRequest } from '../../../middlewares';
import { AuthService, IUserAuthenticationData } from '../../../services/auth.service';

const auth = express.Router();

auth.post('/token', function authenticate(req: IExtendedRequest, res: Response) {
    let hostname = getRequestHostname(req);
    let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress) as string;

    const authService = req.container.get<AuthService>(AuthService.name);

    const input: IUserAuthenticationData = {
        hostname: hostname,
        username: req.body.username,
        password: req.body.password,
        ip: ip,
        clientId: req.headers['user-agent'] as string,
        clientDetails: req.headers['client-details'] as string
    };

    authService.authenticateUser(input)
        .then((tokenInfo) => {
            return res.status(200).json(tokenInfo);
        }, (err) => {
            return res.status(err.status || 401).json({ error: err });
        });
});

export { auth };
