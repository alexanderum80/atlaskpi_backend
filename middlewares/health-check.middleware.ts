import { Response } from 'express';
import { ExtendedRequest } from './extended-request';
import * as winston from 'winston';

export function healthCheck(req: ExtendedRequest, res: Response, next) {
    if (req.path === '/health-check') {
        res.json({ status: 'ok' }).end();
    } else {
        next();
    }
}