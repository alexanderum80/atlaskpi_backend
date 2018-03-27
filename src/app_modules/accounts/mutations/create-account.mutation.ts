import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { AccountsService } from '../../../services/accounts.service';
import { AccountDetails, AccountResult } from '../account.types';
import { CreateAccountActivity } from '../activities/create-account.activity';
import { IExtendedRequest } from '../../../middlewares/extended-request';
import { IAccount } from '../../../domain/master/accounts/Account';

@injectable()
@mutation({
    name: 'createAccount',
    activity: CreateAccountActivity,
    parameters: [
        { name: 'account', type: AccountDetails },
    ],
    output: { type: AccountResult }
})
export class CreateAccountMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(AccountsService.name) private _accountService: AccountsService,
        @inject('Request') private _request: IExtendedRequest
    ) {
        super();
        this.log = false;
    }

    run(data: { account: IAccount }): Promise<IMutationResponse> {
        const that = this;

        return this._accountService.createAccount({
            ip: that._request.ip,
            clientId: 'webapp',
            clientDetails: that._request.headers['user-agent'].toString(),
            account: data.account
        });
    }
}
