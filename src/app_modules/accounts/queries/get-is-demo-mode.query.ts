import { IIdentity } from '../../../domain/app/security/users/identity';
import { IAccountDocument, IAccountModel } from '../../../domain/master/accounts/Account';
import { IUserModel } from '../../../domain/app/security/users/user';
import { IQuery } from '../../../framework/queries/query';
import * as Promise from 'bluebird';
import { injectable, inject } from 'inversify';
import { CheckIsDemoAccountActivity } from '../activities/check-is-demo-account.activity';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { query } from '../../../framework/decorators/query.decorator';
import { Accounts } from '../../../domain/master/accounts/account.model';
import { Users } from '../../../domain/app/security/users/user.model';
import { CurrentAccount } from '../../../domain/master/current-account';

@injectable()
@query({
    name: 'inDemoMode',
    activity: CheckIsDemoAccountActivity,
    output: { type: GraphQLTypesMap.Boolean }
})
export class GetIsDemoModeQuery implements IQuery<boolean> {

    constructor(
        @inject(CurrentAccount.name) private _currentAccount: CurrentAccount,
        @inject(Users.name) private _users: IUserModel) { }

    run(data: any): Promise<boolean> {
        const that = this;
        return new Promise<boolean>((resolve, reject) => {
            // make sure this request is from a logged user
            if (!that._users.model) {
                return resolve(false);
            }

            const inDemo = that._currentAccount.get.demoMode === undefined ?
                false : that._currentAccount.get.demoMode;

            resolve(inDemo);
        });
    }
}
