import { IntegrationController } from '../controllers/integration-controller';
import { ExtendedRequest } from '../middlewares/index';
import * as logger from 'winston';
import * as express from 'express';
import { Request, Response } from 'express';

const integration = express.Router();

integration.get('/integration', (req: ExtendedRequest, res: Response) => {
    logger.debug('processing an integration... ');

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
            </body>
            </html>`);
            return;
    }

    // code flow authentication only at this point
    if (!req.query.code || !req.query.state) {
        return res.status(401).json({ error: 'invalid query string' }).end();
    }

    const integrationController = new IntegrationController(req.masterContext.Connector, req.query);

    if (!integrationController) {
        const err = 'something went wrong processing the integration...';
        logger.error(err);
        res.status(500).send(err);
    }

    integrationController.initialize().then(() => {
        integrationController.executeFlow(req.originalUrl).then(result => {
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
                    </body>
                    </html>`);
                return;
            }
        })
        .catch(err => {
            logger.error(err);
            res.status(500).send(err);
            return;
        });
    })
    .catch(err => {
        logger.error(err);
        res.status(500).send(err);
        return;
    });
});

export { integration };