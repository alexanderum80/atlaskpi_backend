import { IntegrationConnectorFactory } from '../data/integrations/integration-connectors.factory';
import { IOAuthConnector } from '../data/integrations/models/connector-base';
import { IAppModels } from '../data/models/app/app-models';
import { IMasterModels } from '../data/models/master/index';

export class IntegrationController {
    private _connector: IOAuthConnector;

    constructor(private _masterContext: IMasterModels,
                private _appContext: IAppModels,
                query: any,
                hostname?: string) {
        if (!this._masterContext || !this._appContext || !query) {
            console.log('missing paramters...');
            return null;
        }

        const tokens = query.state.split('+');

        if (!tokens || tokens.length > 2) {
            console.log('invalid state...');
            return null;
        }

        const connectorCode = tokens[0];
        const connector = IntegrationConnectorFactory.getInstance(connectorCode, hostname);
    }
}