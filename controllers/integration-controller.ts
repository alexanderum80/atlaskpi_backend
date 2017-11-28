import { IConnector } from '../data/models/master/connectors/IConnector';
import { IntegrationConnectorFactory } from '../data/integrations/integration-connectors.factory';
import { IOAuthConnector } from '../data/integrations/models/connector-base';
import { IAppModels } from '../data/models/app/app-models';
import { IMasterModels } from '../data/models/master/index';
import { ConnectorTypeEnum, getConnectorTypeId } from './../data/integrations/models/connector-type';

export interface IExecutionFlowResult {
    success?: boolean;
    connector?: IConnector;
}

export class IntegrationController {
    private _connector: IOAuthConnector;
    private _hostName: string;
    private _companyName: string;

    constructor(private _masterContext: IMasterModels, private _appContext: IAppModels, query: any) {
        if (!this._masterContext /*|| !this._appContext*/ || !query) {
            console.log('missing paramters...');
            return null;
        }

        const tokens = query.state.split(/\s/);

        if (!tokens || tokens.length > 2) {
            console.log('invalid state...');
            return null;
        }

        const connectorCode = tokens[0];
        this._hostName = tokens[1];

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
                    reject('getToken error response');
                    return;
                }

                const connectorConfig = that._connector.getConfiguration();

                if (this._hostName.indexOf('.') !== -1) {
                    this._hostName = this._hostName.split('.')[0];
                }

                const connObj: IConnector = {
                    name: that._connector.getName(),
                    active: true,
                    config: connectorConfig,
                    databaseName: this._hostName,
                    type: getConnectorTypeId(that._connector.getType()),
                    createdBy: 'backend',
                    createdOn: new Date(Date.now()),
                    uniqueKeyValue: that._connector.getUniqueKeyValue()
                };

                that._masterContext.Connector.addConnector(connObj)
                    .then(() => {
                        const flowResult: IExecutionFlowResult = {
                            success: true,
                            connector: connObj
                        };
                        resolve(flowResult);
                        return;
                    })
                    .catch(err => reject(err));
            });
        });
    }
}