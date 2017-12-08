import { LinkedInConnector } from '../data/integrations/models/linkedin/linkedin-connector';
import { isObject } from 'util';
import { IConnector, IConnectorDocument, IConnectorModel } from './../data/models/master/connectors/IConnector';
import { ConnectorTypeEnum, getConnectorTypeId } from './../data/integrations/models/connector-type';
import { IntegrationConnectorFactory } from './../data/integrations/integration-connectors.factory';
import { IOAuthConnector } from './../data/integrations/models/connector-base';
import { IAppModels } from './../data/models/app/app-models';
import { IMasterModels } from './../data/models/master/master-models';
import * as Promise from 'bluebird';
import * as logger from 'winston';

interface IExecutionFlowResult {
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

    constructor(private _connectorModel: IConnectorModel, private _query: any) {
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

                // Special case of Instagram
                // Instagram doesnt let you chose wich company you are adding
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
}