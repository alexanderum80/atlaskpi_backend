import * as url from 'url';
import * as express from 'express';
import { Request, Response } from 'express';
import { AuthController } from '../controllers';
import makeDefaultConnection from '../data/db-connector';
import { ExtendedRequest } from '../middlewares';
import { LogController } from '../controllers';

import { getContext } from '../data/models/app/app-context';

const log = express.Router();

log.get('/log', function user(req: ExtendedRequest, res: Response) {
    if (!req.identity) {
        return res.status(401).json({ error: 'Invalid token' }).end();
    }

    let clientId = req.headers['clientId'];
    let level = req.body.level;
    let message = req.body.message;

    let log = new LogController(req.appContext);
    log.createLog(clientId, level, message).then((entry) => res.send(200))
    .catch((err) => res.send(500, err));
});

export { log };