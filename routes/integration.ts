import { ConnectorTypeEnum, getConnectorTypeId } from './../data/integrations/models/connector-type';
import { IConnector } from '../data/models/master/connectors';
import { TwitterIntegrationController } from './../controllers/twitter-integration-controller';
import { IExecutionFlowResult, IntegrationController } from '../controllers/integration-controller';
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

    const integrationController = new IntegrationController(req.masterContext.Connector,
                                                            req.masterContext.Account,
                                                            req.query);

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

integration.get('/integration/twitter/:company_name/request-token', (req: ExtendedRequest, res: Response) => {
    logger.debug('processing a twitter integration... ');
    const twitterInt = new TwitterIntegrationController(req.masterContext.Connector, req.params.company_name);

    twitterInt.initialize().then(() => {
        twitterInt.getRequestToken(req, res).then(() => {
            console.log('redirected...');
        }).catch(function(err) {
            console.log(err);
        });
    });
});

integration.get('/integration/twitter/:company_name/access-token', (req: ExtendedRequest, res: Response) => {
    logger.debug('processing a twitter integration... ');
    const twitterInt = new TwitterIntegrationController(req.masterContext.Connector, req.params.company_name);
    const that = this;

    twitterInt.initialize().then(() => {
        twitterInt.getAccessToken(req, res).then(tokenResponse => {
            twitterInt.getUserInfo(tokenResponse).then(user => {
                const connObj: IConnector = {
                    name: user.name,
                    active: true,
                    config: { token: tokenResponse, userId: user.id },
                    databaseName: req.params.company_name,
                    type: getConnectorTypeId(ConnectorTypeEnum.Twitter),
                    createdBy: 'backend',
                    createdOn: new Date(Date.now()),
                    uniqueKeyValue: { key: 'config.userId',
                                      value: user.id }
                };

                req.masterContext.Connector.addConnector(connObj).then(() => {
                    const flowResult: IExecutionFlowResult = {
                        success: true,
                        connector: connObj
                    };
                    res.send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <script>
                            window.opener.postMessage({messageSource: 'atlasKPIIntegrations', connectorName: '${flowResult.connector.name}', success: true }, '*');
                            window.close();
                        </script>
                    </head>
                    <body>
                    </body>
                    </html>`);
                    return;
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