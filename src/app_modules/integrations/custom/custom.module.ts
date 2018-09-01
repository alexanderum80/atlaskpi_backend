import { CreateCustomConnectorMutation } from './mutations/create-custom-connector.mutation';
import { AppModule, ModuleBase } from '../../../framework/decorators/app-module';

@AppModule({
    mutations: [
        CreateCustomConnectorMutation
    ],
    queries: []
})

export class CustomModule extends ModuleBase { }