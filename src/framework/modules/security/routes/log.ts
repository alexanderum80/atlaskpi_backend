import { getRequestHostname } from '../lib/utils/helpers';
import { ILogDetails } from '../controllers/log-controller';
import * as url from 'url';
import * as express from 'express';
import { Request, Response } from 'express';
import { AuthController } from '../controllers';
import makeDefaultConnection from '../data/db-connector';
import { ExtendedRequest } from '../middlewares';
import { LogController } from '../controllers';
import * as logger from 'winston';
import * as moment from 'moment';

import { getContext } from '../data/models/app/app-context';

const log = express.Router();

log.post('/log', function user(req: ExtendedRequest, res: Response) {
    logger.debug('recieving a log entry...');
    if (!req.identity) {
        return res.status(401).json({ error: 'Invalid token' }).end();
    }

    const log = new LogController(req.appContext);

    const logDetails: ILogDetails = {
        timestamp:  new Date(req.headers['timestamp']),
        ip: (req.headers['x-forwarded-for'] || req.connection.remoteAddress) as string,
        hostname: getRequestHostname(req),
        clientId: req.headers['user-agent'] as string,
        clientDetails: req.headers['client-details'] as string,

        level: Number(req.body.level),
        message: req.body.message
    };

    log.processLogEntry(logDetails).then(() => {
        logger.debug('log entry processed sucessfully');
        res.status(200).send();
        return;
    })
    .catch((err) => {
        logger.error('something went wrong processing the log entry: ' + err);
        res.status(500).send(err);
        return;
    });
});

export { log };