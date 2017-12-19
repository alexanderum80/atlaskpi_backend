import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { RemoveConnectorMutation } from './mutations/remove-connector.mutation';
import { ConnectorsQuery } from './queries/connectors.query';

@AppModule({
    mutations: [
        RemoveConnectorMutation
    ],
    queries: [
        ConnectorsQuery
    ]
})
export class ConnectorsModule extends ModuleBase { }