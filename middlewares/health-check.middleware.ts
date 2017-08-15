import { Response } from 'express';
import { ExtendedRequest } from './extended-request';
import * as winston from 'winston';

export function healthCheck(req: ExtendedRequest, res: Response, next) {
    console.log(req.path);

    if (req.path === '/health-check') {
        res.json({ status: 'ok' }).end();
    } else {
        next();
    }
}