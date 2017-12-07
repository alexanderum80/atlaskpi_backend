import { Response } from 'express';

import { IExtendedRequest } from './extended-request';

export function healthCheck(req: IExtendedRequest, res: Response, next) {
    if (req.path === '/health-check') {
        res.json({ status: 'ok' }).end();
    } else {
        next();
    }
}