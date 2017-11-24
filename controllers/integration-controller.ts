import { IntegrationConnectorFactory } from './../data/integrations/integration-connectors.factory';
import { IOAuthConnector } from './../data/integrations/models/connector-base';
import { IAppModels } from './../data/models/app/app-models';
import { IMasterModels } from './../data/models/master/master-models';
import * as Promise from 'bluebird';
import * as logger from 'winston';

export class IntegrationController {

    private _connector: IOAuthConnector;

    constructor(private masterContext: IMasterModels, private appContext: IAppModels, query: any) {
        if (!masterContext || !appContext || !query) {
            console.log('missing parameters...');
            return null;
        }

        const tokens = query.state.split('+');

        if (!tokens || tokens.length < 2) {
            console.log('invalid state...');
            return null;
        }

        const connectorCode = tokens[0];

        const connector = IntegrationConnectorFactory.getInstance(connectorCode);


    }




}
