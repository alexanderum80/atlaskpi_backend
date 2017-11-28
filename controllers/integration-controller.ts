import { IConnector } from './../data/models/master/connectors/IConnector';
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

export class IntegrationController {

    private _connector: IOAuthConnector;
    private _companyName: string;

    constructor(private _masterContext: IMasterModels, private appContext: IAppModels, query: any) {
        if (!_masterContext ||
            // !appContext ||
            !query) {
            console.log('missing parameters...');
            return null;
        }

        const tokens = query.state.split(':');

        if (!tokens || tokens.length < 2) {
            console.log('invalid state...');
            return null;
        }

        const connectorCode = tokens[0];
        const connector = IntegrationConnectorFactory.getInstance(connectorCode);

        if (!connector) {
            console.log('connector type not supported');
            return null;
        }

        this._connector = connector;
        this._companyName = tokens[1];

        if (connector.getType() === ConnectorTypeEnum.QuickBooksOnline) {
            connector.setRealmId(query.realmId);
        }
    }

    public executeFlow(originalUrl: string): Promise<IExecutionFlowResult> {
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
                    createdOn: new Date(Date.now())
                };

                that._masterContext.Connector.create(connObj).then(() => {
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
