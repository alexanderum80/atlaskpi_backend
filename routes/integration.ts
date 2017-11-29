import { getRequestHostname } from '../lib/utils/index';
import { IntegrationController } from '../controllers/integration-controller';
import { ExtendedRequest } from '../middlewares/index';
import * as logger from 'winston';
import * as express from 'express';
import { Request, Response } from 'express';

const integration = express.Router();

integration.get('/integration', (req: ExtendedRequest, res: Response) => {
    if (req.query.hasOwnProperty('error') && req.query.error === 'access_denied') {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <script>
                    window.close();
                </script>
            </head>
            <body>
            success
            </body>
            </html>`);
            return;
    }

    if (!req.query.code || !req.query.state) {
        return res.status(401).json({ error: 'invalid query string' }).end();
    }

    const integration_controller = new IntegrationController(req.masterContext, req.appContext, req.query);

    if (!integration_controller) {
        const err = 'something went wrong processing the integration...';
        logger.error(err);
        res.status(500).send(err);
    }

    integration_controller.executeFlow(req.originalUrl).then(result => {
        if (result.success) {
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <script>
                        window.opener.postMessage({messageSource: 'atlasKPIIntegrations', connectorName: '${result.connector.name}', success: true }, '*');
                        window.close();
                    </script>
                </head>
                <body>
                success
                </body>
                </html>`);
            return;
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

export { integration };