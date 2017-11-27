import { IConnector } from '../data/models/master/connectors/IConnector';
import { IntegrationConnectorFactory } from '../data/integrations/integration-connectors.factory';
import { IOAuthConnector } from '../data/integrations/models/connector-base';
import { IAppModels } from '../data/models/app/app-models';
import { IMasterModels } from '../data/models/master/index';
import { getConnectorTypeId } from './../data/integrations/models/connector-type';

export interface UrlHelper {
    hostname?: string;
    protocol?: string;
}

export class IntegrationController {
    private _connector: IOAuthConnector;

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
        const connector = IntegrationConnectorFactory.getInstance(connectorCode);

        if (!connector) {
            console.log('connector type not supported');
            return null;
        }

        this._connector = connector;
    }

    public executeFlow(originalUrl: string): Promise<boolean> {
        const that = this;
        return new Promise<boolean>((resolve, reject) => {
            that._connector.getToken(originalUrl).then(token => {
                if (!token) {
                    reject('getToken error response');
                    return;
                }

                const connectorConfig = that._connector.getConfiguration();

                const connObj: IConnector = {
                    name: 'square-one',
                    active: true,
                    config: connectorConfig,
                    databaseName: 'test-company-tfn',
                    type: getConnectorTypeId(that._connector.getType()),
                    createdBy: 'backend',
                    createdOn: new Date(Date.now())
                };

                that._masterContext.Connector.addConnector(connObj)
                    .then(() => resolve(true))
                    .catch(err => reject(err));
            });
        });
    }
}