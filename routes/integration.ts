import { getRequestHostname } from '../lib/utils/index';
import { IntegrationController } from '../controllers/integration-controller';
import { ExtendedRequest } from '../middlewares/index';
import * as logger from 'winston';
import * as express from 'express';
import { Request, Response } from 'express';

const integration = express.Router();

// req.query = {"code":"sq0cgp-R9TIzSSC9WYX5g_hTuQtIg","response_type":"code","state":"square+testing_sample.d"}

integration.post('/integration', (req: ExtendedRequest, res: Response) => {
    if (!req.query.code || !req.query.state) {
        return res.status(401).json({ error: 'invalid query string' }).end();
    }

    let hostname = getRequestHostname(req);
    if (!hostname) {
        res.status(400).json({ error: 'invalid hostname'  });
    }

    const integration_controller = new IntegrationController(req.masterContext, req.appContext, req.query);

    if (!integration_controller) {
        const err = 'something went wrong processing the integration...';
        logger.error(err);
        res.status(500).send(err);
    }

    res.status(200).end();
    return;
});

export { integration };