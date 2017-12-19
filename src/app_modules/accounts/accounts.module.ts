import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { GetIsDemoModeQuery } from './queries/get-is-demo-mode.query';

@AppModule({
    queries: [
        GetIsDemoModeQuery
    ]
})
export class AccountsModule extends ModuleBase { }
