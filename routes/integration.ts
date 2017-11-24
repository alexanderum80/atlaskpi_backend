import { IntegrationController } from './../controllers/integration-controller';
import * as url from 'url';
import * as express from 'express';
import { ExtendedRequest } from '../middlewares';
import * as logger from 'winston';
import { Request, Response } from 'express';

import { getContext } from '../data/models/app/app-context';

const integration = express.Router();

integration.post('/integration', (req: ExtendedRequest, res: Response)  => {
    logger.debug('processing an integration... ');

    // code flow authentication only at this point
    if (!req.query.code || !req.query.state) {
        return res.status(401).json({ error: 'invalid query string' }).end();
    }

    const integration = new IntegrationController(req.masterContext, req.appContext, req.query);

    if (!integration) {
        const err = 'something went wrong processing the the integration...';
        logger.error(err);
        res.status(500).send(err);
    }

    res.status(200).send();
    return;
});

export { integration };