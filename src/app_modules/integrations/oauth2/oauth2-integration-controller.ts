import { GAJobsQueueService } from './../../../services/queues/ga-jobs-queue.service';
import { CurrentAccount } from './../../../domain/master/current-account';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { isObject } from 'util';

import { Logger } from '../../../domain/app/logger';
import { IConnector, IConnectorDocument } from '../../../domain/master/connectors/connector';
import { IExtendedRequest } from '../../../middlewares/extended-request';
import { getFacebookConnection } from '../facebook/facebook-connection-handler';
import { FacebookConnector } from '../facebook/facebook-connector';
import { FacebookService } from '../facebook/facebook.service';
import { getGoogleAnalyticsConnectors } from '../google-analytics/google-analytics-integration-flow';
import { IOAuthConnector } from '../models/connector-base';
import { getConnectorTypeId } from '../models/connector-type';
import { loadIntegrationConfig } from '../models/load-integration-controller';
import { SocialNetwork } from './../../../domain/app/social-networks/social-network.model';
import { Connectors } from './../../../domain/master/connectors/connector.model';
import { GoogleAnalyticsConnector } from './../google-analytics/google-analytics-connector';
import { LinkedInConnector } from './../linkedin/linkedin-connector';
import { errorExecutionFlow, IExecutionFlowResult } from './../models/execution-flow';
import { IntegrationConnectorFactory } from './../models/integration-connectors.factory';
import { runTask } from '../helpers/run-task.helper';

@injectable()
export class IntegrationController {

    private _connector: IOAuthConnector;
    private _companySubdomain: string;
    private stateTokens: string[];
    private _integrationConfig: IConnectorDocument;
    private _query: any;

    constructor(@inject(Connectors.name) private _connectorModel: Connectors,
                @inject(IntegrationConnectorFactory.name) private _integrationConnectorFactory: IntegrationConnectorFactory,
                @inject(SocialNetwork.name) private _socialNetworkModel: SocialNetwork,
                @inject('Request') private req: IExtendedRequest,
                @inject(CurrentAccount.name) private _currentAccount: CurrentAccount,
                @inject(Logger.name) private _logger: Logger,
                @inject(GAJobsQueueService.name) private _queueService: GAJobsQueueService) {

        this._query = req.query;

        this.stateTokens = this._query.state.split(':');

        if (!this.stateTokens || this.stateTokens.length < 2) {
            console.log('invalid state...');
            return null;
        }
    }

    public initialize(): Promise<any> {
        const that = this;
        const connectorCode = that.stateTokens[0];
        return new Promise<any>((resolve, reject) => {
            loadIntegrationConfig(that._connectorModel, connectorCode).then(configDoc => {
                that._integrationConfig = configDoc;
                const connector = that._integrationConnectorFactory.getInstance(configDoc.config, connectorCode, { query: that._query });

                if (!connector) {
                    reject('connector type not supported');
                    return;
                }

                that._connector = connector;
                that._companySubdomain = this.stateTokens[1];

                resolve();
                return;
            })
            .catch(err => reject(err));
        });
    }

    public executeFlow(originalUrl: string): Promise<IExecutionFlowResult> {
        if (!this._connector) {
            return Promise.reject('you have to call initialize method...');
        }

        const that = this;
        return new Promise<IExecutionFlowResult>((resolve, reject) => {
            that._connector.getToken(originalUrl).then(token => {
                if (!token) {
                    reject('something went wrong, could not retrieve a token');
                    return;
                }

                // Special case of LinkedIn
                // Linkedin doesnt let you chose wich company you are adding
                if (that._connector instanceof LinkedInConnector) {
                    that._handleLinkedInConnectorFlow().then(flowResult => {
                        resolve(flowResult);
                        return;
                    })
                    .catch(err => {
                        reject(err);
                        return;
                    });

                    return;
                }

                // Special case of Faceook
                // Facebook doesnt let you chose wich page you are adding
                if (that._connector instanceof FacebookConnector) {
                    that._handleFacebookConnectorFlow().then(flowResult => {
                        resolve(flowResult);
                        return;
                    })
                    .catch(err => {
                        reject(err);
                        return;
                    });

                    return;
                }

                 // Special case of Google Analitycs
                // doesnt let you chose wich account you are adding
                if (that._connector instanceof GoogleAnalyticsConnector) {
                    that._handleGoogleAnalyticsConnectorFlow().then(flowResult => {
                        resolve(flowResult);
                        return;
                    })
                    .catch(err => {
                        reject(err);
                        return;
                    });

                    return;
                }

                const connectorConfig = that._connector.getConfiguration();

                const connObj: IConnector = {
                    name: that._connector.getName(),
                    active: true,
                    config: connectorConfig,
                    databaseName: that._currentAccount.get.database.name,
                    subdomain: that._companySubdomain,
                    type: getConnectorTypeId(that._connector.getType()),
                    createdBy: 'backend',
                    createdOn: new Date(Date.now()),
                    uniqueKeyValue: that._connector.getUniqueKeyValue()
                };

                that._connectorModel.model.addConnector(connObj).then((newConnector) => {

                    // request to the scheduler to run the task
                    runTask (that._integrationConfig, newConnector.id)
                            .then(res => that._logger.debug(res))
                            .catch(e => that._logger.error(e));

                    const flowResult: IExecutionFlowResult = {
                        success: true,
                        connector: connObj
                    };
                    resolve(flowResult);
                    return;
                })
                .catch(err => {
                    reject(err);
                    return;
                });
            })
            .catch(err => {
                const error = isObject(err) ? JSON.stringify(err) : err;
                console.error('error getting token...' + error);
                reject(err);
                return;
            });
        });
    }

    private _handleLinkedInConnectorFlow(): Promise<IExecutionFlowResult> {
        const companies = this._connector.getLinkedInCompanies();

        if (!companies || !companies.length) {
            const flowResult: IExecutionFlowResult = {
                success: false,
                error: 'Your LinkedIn Account is not admin of any page'
            };
            return Promise.resolve(flowResult);
        }

        const that = this;
        const promises = [];
        const connectorConfig = this._connector.getConfiguration();
        const uniqueKeyValue = this._connector.getUniqueKeyValue();
        const type = getConnectorTypeId(this._connector.getType());
        let lastConnector;

        companies.forEach(c => {
            connectorConfig.companyId = c.id;
            uniqueKeyValue.value = c.id;
            const newConnector = {
                name: c.name,
                active: true,
                config: { ... connectorConfig },
                databaseName: that._currentAccount.get.database.name,
                subdomain: that._companySubdomain,
                type: type,
                createdBy: 'backend',
                createdOn: new Date(Date.now()),
                uniqueKeyValue: { ... uniqueKeyValue }
            };
            promises.push(that._connectorModel.model.addConnector(newConnector));
            lastConnector = newConnector;
        });

        return new Promise<IExecutionFlowResult>((resolve, reject) => {
            Promise.all(promises).then((connectors) => {

                // request to the scheduler to run the task
                runTask (that._integrationConfig, connectors.map(c => c.id))
                        .then(res => that._logger.debug(res))
                        .catch(e => that._logger.error(e));

                const flowResult: IExecutionFlowResult = {
                    success: true,
                    connector: lastConnector
                };
                resolve(flowResult);
                return;
            })
            .catch(err => {
                reject(err);
                return;
            });
        });
    }

    private _handleFacebookConnectorFlow(): Promise<IExecutionFlowResult> {
        const pages = this._connector.getFacebookPages();

        if (!pages || !pages.length) {
            const flowResult: IExecutionFlowResult = {
                success: false,
                error: 'Facebook account does not contains pages'
            };
            return Promise.resolve(flowResult);
        }

        const that = this;
        const promises = [];
        const connectorConfig = this._connector.getConfiguration();
        const uniqueKeyValue = this._connector.getUniqueKeyValue();
        const type = getConnectorTypeId(this._connector.getType());
        let lastConnector;

        pages.forEach(c => {
            connectorConfig.pageId = c.id;
            uniqueKeyValue.value = c.id;
            const newConnector = {
                name: c.name,
                active: true,
                config: { ... connectorConfig },
                databaseName: that._currentAccount.get.database.name,
                subdomain: that._companySubdomain,
                type: type,
                createdBy: 'backend',
                createdOn: new Date(Date.now()),
                uniqueKeyValue: { ... uniqueKeyValue }
            };
            promises.push(that._connectorModel.model.addConnector(newConnector));
            lastConnector = newConnector;
        });

        return new Promise<IExecutionFlowResult>((resolve, reject) => {
            Promise.all(promises).then((connectors) => {

                // this is where I pull the metrics I added this for the facebook certification
                // pulling metrics is the job of the facebook-connector
                Promise.map(connectors, c => that._getConnectorsMetrics(that._socialNetworkModel,
                                                                        that._integrationConfig,
                                                                        c))
                        .then(() => {
                          console.log('metrics updated for facebook integration');
                        })
                        .catch(err => {
                            console.error('could not update all metrics for facebook integration' + err);
                            return;
                        });
                // I'm not waiting this promises on purpose, the code between the comments is just for getting the facebook app approval

            const flowResult: IExecutionFlowResult = {
                success: true,
                connector: lastConnector
            };
            resolve(flowResult);
            return;
            })
            .catch(err => {
                reject(err);
                return;
            });
        });
    }

    private _getConnectorsMetrics(socialNetworkModel: SocialNetwork, integration: IConnector, connector: IConnectorDocument): Promise<any> {
        const that = this;
        return new Promise<any>((resolve, reject) => {
            getFacebookConnection(integration, connector).then(connectionResponse => {
                const service = new FacebookService(    that._socialNetworkModel,
                                                        connectionResponse,
                                                        connector);
                service .run()
                        .then(() => {
                    resolve('done');
                    return;
                })
                .catch(err => {
                    console.log(err);
                    resolve(err);
                    return;
                });
            })
            .catch(err => {
                    // usually Token invalid, should log the error, probably should send an email too
                    console.log(err);
                    resolve(err);
                    return;
            });
        });
    }

    private _handleGoogleAnalyticsConnectorFlow(): Promise<IExecutionFlowResult> {
        const token = this._connector.token();

        if (!token) {
            return Promise.resolve(errorExecutionFlow( 'google analytics integration couldn\'t obtain a token'));
        }

        const that = this;
        return new Promise<IExecutionFlowResult>((resolve, reject) => {
            getGoogleAnalyticsConnectors(
                that._connector,
                that._integrationConfig,
                that._currentAccount.get.database.name,
                that._companySubdomain,
                that._queueService)
            .then(connectors => {
                Promise .map(connectors, c => that._connectorModel.model.addConnector(c))
                        .then(() => {
                            const flowResult: IExecutionFlowResult = {
                                success: true,
                                connector: connectors[0]
                            };
                            resolve(flowResult);
                            return;
                        })
                        .catch(err => reject(err));
            })
            .catch(err => {
                resolve(errorExecutionFlow(err));
                return;
            });
        });
    }

}