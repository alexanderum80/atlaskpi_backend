import { Response } from 'express';

import { IExtendedRequest } from '../../../middlewares/extended-request';
import { IntegrationController } from './oauth2-integration-controller';
import { JsSafeString } from '../../../helpers/string.helpers';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';

const genericErrorPage = fs.readFileSync(__dirname + '/templates/generic-integration-error.hbs', 'utf8');

export async function handleOAuth2Itegration(req: IExtendedRequest, res: Response) {
    const logger = req.logger;

    logger.debug('processing an oauth2 integration... ');

    if (req.query.hasOwnProperty('error') && req.query.error === 'access_denied') {
        return res.status(200).send(genericErrorPage);
    }

    // code flow authentication only at this point
    if (!req.query.code || !req.query.state) {
        // return res.status(401).json({ error: 'invalid query string' }).end();
        return res.status(500).send(genericErrorPage);
    }

    const integrationController = req.Container.instance.get<IntegrationController>(IntegrationController.name);

    if (!integrationController) {
        const err = 'something went wrong processing the integration...';
        logger.error(err);
        return res.status(200).send(genericErrorPage);
    }

    try {
        await integrationController.initialize();
        const result = await integrationController.executeFlow(req.originalUrl);

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
    } catch (err) {
        logger.error(err);
        // res.status(500).send(err);
        return res.status(500).send(genericErrorPage);
    }
}