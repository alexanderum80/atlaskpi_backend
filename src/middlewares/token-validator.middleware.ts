import { IAppConfig } from '../configuration/config-models';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as winston from 'winston';

import { IExtendedRequest } from './extended-request';

export function tokenValidator(req: IExtendedRequest, res: Response, next) {

    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    const config = req.container.get<IAppConfig>('Config');

    if (token) {
        jwt.verify(token, config.token.secret, (err, identity) => {
            if (err) {
                winston.error('Invalid token', { token: token });
                return res.status(401).json({ error: 'Invalid token' }).end();
            } else {
                req.identity = identity;
                winston.debug('Signin request (adding identity)', { identity: req.identity });
                return next();
            }
        });
    } else {
        return next();
    }
}