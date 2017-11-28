import { IntegrationController } from './../controllers/integration-controller';
import * as url from 'url';
import * as express from 'express';
import { ExtendedRequest } from '../middlewares';
import * as logger from 'winston';
import { Request, Response } from 'express';

import { getContext } from '../data/models/app/app-context';

const integration = express.Router();

integration.get('/integration', (req: ExtendedRequest, res: Response)  => {
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

    integration.executeFlow(req.originalUrl).then(result => {
        if (result.success) {
            res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <script>
                    debugger;
                    window.opener.postMessage({messageSource: 'atlasKPIIntegrations', connectorName: '${result.connector.name}', success: true }, '*');
                    setTimeout(function(){ window.close();}, 500);
                </script>
            </head>
            <body>
            success
            </body>
            </html>`);
            return;
        }
    })
    .catch(err => {
        logger.error(err);
        res.status(500).send(err);
    });
});

export { integration };