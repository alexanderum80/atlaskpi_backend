import { CreateCallRailConnectorMutation } from './mutations/create-callrail-connector.mutation';
import { AppModule, ModuleBase } from '../../../framework/decorators/app-module';

@AppModule({
    mutations: [
        CreateCallRailConnectorMutation
    ],
    queries: []
})

export class CallRailModule extends ModuleBase { }