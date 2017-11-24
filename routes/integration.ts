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

    

    res.status(200).send();
    return;
});

export { integration };