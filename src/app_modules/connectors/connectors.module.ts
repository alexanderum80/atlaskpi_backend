import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { ConnectorsQuery } from './queries/connectors.query';

@AppModule({
    mutations: [
    ],
    queries: [
        ConnectorsQuery
    ]
})
export class ConnectorsModule extends ModuleBase { }