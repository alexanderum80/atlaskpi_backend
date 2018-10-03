import { inject, injectable } from 'inversify';

import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { AccountsService } from '../../../services/accounts.service';
import { AccountNameAvailableActivity } from '../activities/account-name-available.activity';

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
        @inject(AccountsService.name) private _accountService: AccountsService,
    ) { }

    async run(data: any): Promise<boolean> {
        return this._accountService.accountNameAvailable(data.name);
    }
}
