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
                const connector = IntegrationConnectorFactory.getInstance(configDoc.config, connectorCode);

                if (!connector) {
                    reject('connector type not supported');
                    return;
                }

                this._connector = connector;
                this._companyName = this.stateTokens[1];

                if (connector.getType() === ConnectorTypeEnum.QuickBooksOnline) {
                    connector.setRealmId(this._query.realmId);
                }

                resolve();
                return;
            });
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

                const connectorConfig = that._connector.getConfiguration();

                const connObj: IConnector = {
                    name: that._connector.getName(),
                    active: true,
                    config: connectorConfig,
                    databaseName: this._companyName,
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
            });
        });
    }
}