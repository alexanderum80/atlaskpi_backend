import { Response } from 'express';

import { IConnector } from '../../../domain/master/connectors/connector';
import { Connectors } from '../../../domain/master/connectors/connector.model';
import { IExtendedRequest } from '../../../middlewares/extended-request';
import { ConnectorTypeEnum, getConnectorTypeId } from '../models/connector-type';
import { IExecutionFlowResult } from '../models/execution-flow';
import { TwitterIntegrationController } from './twitter-integration-controller';

export function handleTwitterRequestToken(req: IExtendedRequest, res: Response) {
    const logger = req.logger;
    logger.debug('processing a twitter integration... ');
    const twitterInt = req.Container.instance.get<TwitterIntegrationController>(TwitterIntegrationController.name);

    twitterInt.initialize(req.params.company_name).then(() => {
        twitterInt.getRequestToken(req, res).then(() => {
            console.log('redirected...');
        }).catch(function(err) {
            console.log(err);
        });
    });
}

export function handleTwitterAccessToekn(req: IExtendedRequest, res: Response) {
    const logger = req.logger;
    logger.debug('processing a twitter integration... ');
    const twitterInt = req.Container.instance.get<TwitterIntegrationController>(TwitterIntegrationController.name);

    twitterInt.initialize(req.params.company_name).then(() => {
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

                const connector = req.Container.instance.get<Connectors>(Connectors.name);

                connector.model.addConnector(connObj).then(() => {
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
        });
    });
}