import { Response } from 'express';

import { IExtendedRequest } from '../../../middlewares/extended-request';
import { IntegrationController } from './oauth2-integration-controller';
import { JsSafeString } from '../../../helpers/string.helpers';

export function handleOAuth2Itegration(req: IExtendedRequest, res: Response) {
    const logger = req.logger;

    logger.debug('processing an oauth2 integration... ');

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

    const integrationController = req.Container.instance.get<IntegrationController>(IntegrationController.name);

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
                                window.opener.postMessage({messageSource: 'atlasKPIIntegrations', connectorName: '${JsSafeString(result.connector.name)}', success: true }, '*');
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
}