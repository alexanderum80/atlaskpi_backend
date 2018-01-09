import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { GetIsDemoModeQuery } from './queries/get-is-demo-mode.query';
import { AccountNameAvailableQuery } from './queries/account-name-available.query';

@AppModule({
    queries: [
        GetIsDemoModeQuery,
        AccountNameAvailableQuery
    ]
})
export class AccountsModule extends ModuleBase { }
