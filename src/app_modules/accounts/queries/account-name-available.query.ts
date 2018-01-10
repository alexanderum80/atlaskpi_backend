import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IUserModel } from '../../../domain/app/security/users/user';
import { Users } from '../../../domain/app/security/users/user.model';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { AccountNameAvailableActivity } from '../activities/account-name-available.activity';
import { Accounts } from '../../../domain/master/accounts/account.model';

@injectable()
@query({
    name: 'accountNameAvailable',
    activity: AccountNameAvailableActivity,
    parameters: [
        { name: 'name', type: GraphQLTypesMap.String, required: true }
    ],
    output: { type: GraphQLTypesMap.Boolean }
})
export class AccountNameAvailableQuery implements IQuery<boolean> {

    constructor(
        @inject(Accounts.name) private _accounts: Accounts
    ) { }

    run(data: any): Promise<boolean> {
        return this._accounts.model.accountNameAvailable(data.name);
    }
}
