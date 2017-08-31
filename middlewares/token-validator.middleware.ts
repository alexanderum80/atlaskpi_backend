import * as jwt from 'jsonwebtoken';
import { config } from '../config';
import { Request, Response } from 'express';
import { ExtendedRequest } from './extended-request';
import * as winston from 'winston';

export function tokenValidator(req: ExtendedRequest, res: Response, next) {

    let token = req.body.token || req.query.token || req.headers['x-access-token'];

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