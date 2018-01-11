import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { ReloadDataMutation } from './mutations/reload-data.mutation';

@AppModule({
    mutations: [
        ReloadDataMutation
    ],
    queries: []
})

export class GoogleSpreadSheetModule extends ModuleBase {}