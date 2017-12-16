import { getContext } from '../data/models/app/app-context';
import { IAccountModel } from './../data/models/master/accounts/IAccount';
import { ISocialNetworkModel } from './../data/models/app/social-network/ISocialNetwork';
import * as Promise from 'bluebird';
import { isObject } from 'util';

import { getFacebookConnection } from '../data/integrations/models/facebook/facebook-connection-handler';
import { FacebookService } from '../data/integrations/models/facebook/facebook.service';
import { LinkedInConnector } from '../data/integrations/models/linkedin/linkedin-connector';
import { IntegrationConnectorFactory } from './../data/integrations/integration-connectors.factory';
import { IOAuthConnector } from './../data/integrations/models/connector-base';
import { getConnectorTypeId } from './../data/integrations/models/connector-type';
import { FacebookConnector } from './../data/integrations/models/facebook/facebook-connector';
import { IConnector, IConnectorDocument, IConnectorModel } from './../data/models/master/connectors/IConnector';

export interface IExecutionFlowResult {
    success: boolean;
    connector?: IConnector;
    error?: string;
}

export function loadIntegrationConfig(connectorModel: IConnectorModel, code: string): Promise<IConnectorDocument> {
    const that = this;
    return new Promise<IConnectorDocument>((resolve, reject) => {
        connectorModel.findOne({ databaseName: 'atlas', type: 'integration-config', name: code, active: true })
            .then(doc => {
                if (!doc) {
                    reject('integration configuration not found or inactive...');
                    return;
                }
                resolve(doc);
                return;
            })
            .catch(err => reject(err));
    });
}

export class IntegrationController {

    private _connector: IOAuthConnector;
    private _companyName: string;
    private stateTokens: string[];
    private _integrationConfig: IConnectorDocument;

    constructor(private _connectorModel: IConnectorModel,
                private _accountModel: IAccountModel,
                private _query: any) {
        if (!_connectorModel ||
            !_query) {
            console.log('missing parameters...');
            return null;
        }

        this.stateTokens = _query.state.split(':');

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
                const connector = IntegrationConnectorFactory.getInstance(configDoc.config, connectorCode, { query: this._query });

                if (!connector) {
                    reject('connector type not supported');
                    return;
                }

                that._connector = connector;
                that._companyName = this.stateTokens[1];

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

                const connectorConfig = that._connector.getConfiguration();

                const connObj: IConnector = {
                    name: that._connector.getName(),
                    active: true,
                    config: connectorConfig,
                    databaseName: that._companyName,
                    type: getConnectorTypeId(that._connector.getType()),
                    createdBy: 'backend',
                    createdOn: new Date(Date.now()),
                    uniqueKeyValue: that._connector.getUniqueKeyValue()
                };

                that._connectorModel.addConnector(connObj).then(() => {
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
                console.log('error getting token...' + error);
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
                error: 'LinkedIn account does not contains companies'
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
                databaseName: that._companyName,
                type: type,
                createdBy: 'backend',
                createdOn: new Date(Date.now()),
                uniqueKeyValue: { ... uniqueKeyValue }
            };
            promises.push(that._connectorModel.addConnector(newConnector));
            lastConnector = newConnector;
        });

        return new Promise<IExecutionFlowResult>((resolve, reject) => {
            Promise.all(promises).then(() => {
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
                databaseName: that._companyName,
                type: type,
                createdBy: 'backend',
                createdOn: new Date(Date.now()),
                uniqueKeyValue: { ... uniqueKeyValue }
            };
            promises.push(that._connectorModel.addConnector(newConnector));
            lastConnector = newConnector;
        });

        return new Promise<IExecutionFlowResult>((resolve, reject) => {
            Promise.all(promises).then((connectors) => {

                // this is where I pull the metrics I added this for the facebook certification
                // pulling metrics is the job of the facebook-connector
                Promise.map(connectors, c => that._getConnectorsMetrics(that._accountModel,
                                                                        that._integrationConfig,
                                                                        c))
                        .then(() => {
                          console.log('metrics updated for facebook integration');
                        })
                        .catch(err => {
                            console.log('could not update all metrics for facebook integration' + err);
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

    private _getConnectorsMetrics(accountModel: IAccountModel, integration: IConnector, connector: IConnectorDocument): Promise<any> {
        const that = this;
        return new Promise<any>((resolve, reject) => {
            accountModel.findAccountByHostname(connector.databaseName).then(account => {
                if (!account) {
                    reject('account not found');
                    return;
                }
                getContext(account.database.uri).then(appContext => {
                    getFacebookConnection(integration, connector).then(connectionResponse => {
                        const service = new FacebookService(    appContext.SocialNetwork,
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
                })
                .catch(err => {
                    console.log('could not get app context for the connector');
                    reject(err);
                    return;
                });
            })
            .catch(err => {
                console.log('could not get the account for the connector');
                reject(err);
                return;
            });
        });
    }
}