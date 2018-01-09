import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { GetIsDemoModeQuery } from './queries/get-is-demo-mode.query';
import { AccountNameAvailableQuery } from './queries/account-name-available.query';
import { CreateAccountMutation } from './mutations/create-account.mutation';

@AppModule({
    queries: [
        GetIsDemoModeQuery,
        AccountNameAvailableQuery
    ],
    mutations: [
        CreateAccountMutation
    ]
})
export class AccountsModule extends ModuleBase { }
