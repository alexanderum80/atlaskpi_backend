import { isObject } from 'util';
import { JsSafeString } from '../../../helpers/string.helpers';
import { Response } from 'express';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';

import { IConnector } from '../../../domain/master/connectors/connector';
import { Connectors } from '../../../domain/master/connectors/connector.model';
import { IExtendedRequest } from '../../../middlewares/extended-request';
import { runTask } from '../helpers/run-task.helper';
import { ConnectorTypeEnum, getConnectorTypeId } from '../models/connector-type';
import { IExecutionFlowResult } from '../models/execution-flow';
import { TwitterIntegrationController } from './twitter-integration-controller';
import { CurrentAccount } from '../../../domain/master/current-account';

const genericErrorPage = Handlebars.compile(fs.readFileSync(__dirname + '/../oauth2/templates/generic-integration-error.hbs', 'utf8'));
const integrationSuccessPage = Handlebars.compile(fs.readFileSync(__dirname + '/../oauth2/templates/integration-success.hbs', 'utf8'));

export function handleTwitterRequestToken(req: IExtendedRequest, res: Response) {
    const logger = req.logger;
    logger.debug('processing a twitter integration... ');
    const twitterInt = req.Container.instance.get<TwitterIntegrationController>(TwitterIntegrationController.name);

    twitterInt.initialize(req.query.company_name).then(() => {
        twitterInt.getRequestToken(req, res).then(() => {
            console.log('redirected...');
        }).catch(err => {
            console.log(err);
            const error = isObject(err) ? JSON.stringify(err) : err;
            return res.status(200).send(genericErrorPage({ error: error }));
        });
    });
}

export function handleTwitterAccessToken(req: IExtendedRequest, res: Response) {
    const logger = req.logger;
    logger.debug('processing a twitter integration... ');
    const twitterInt = req.Container.instance.get<TwitterIntegrationController>(TwitterIntegrationController.name);
    const currentAccount = req.Container.instance.get<CurrentAccount>(CurrentAccount.name);

    twitterInt.initialize(req.query.company_name).then(() => {
        twitterInt.getAccessToken(req, res).then(tokenResponse => {
            twitterInt.getUserInfo(tokenResponse).then(user => {
                const connObj: IConnector = {
                    name: user.name,
                    active: true,
                    config: { token: tokenResponse, userId: user.id },
                    databaseName: currentAccount.get.database.name,
                    subdomain: req.query.company_name, // company name parameter is the hostname aka subdomain
                    type: getConnectorTypeId(ConnectorTypeEnum.Twitter),
                    createdBy: 'backend',
                    createdOn: new Date(Date.now()),
                    uniqueKeyValue: { key: 'config.userId',
                                      value: user.id }
                };

                const connector = req.Container.instance.get<Connectors>(Connectors.name);

                connector.model.addConnector(connObj).then((newConnector) => {
                    runTask (twitterInt.integrationDocument, newConnector.id)
                            .then(res => logger.debug(res))
                            .catch(e => logger.error(e));

                    const flowResult: IExecutionFlowResult = {
                        success: true,
                        connector: connObj
                    };
                    return res.send(integrationSuccessPage({ connectorName: JsSafeString(flowResult.connector.name) }));
                })
                .catch(err => {
                    logger.error(err);
                    const error = isObject(err) ? JSON.stringify(err) : err;
                    return res.status(200).send(genericErrorPage({ error: error }));
                });
            })
            .catch(err => {
                logger.error(err);
                const error = isObject(err) ? JSON.stringify(err) : err;
                return res.status(200).send(genericErrorPage({ error: error }));
            });
        });
    });
}