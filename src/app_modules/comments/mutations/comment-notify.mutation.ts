import { CurrentAccount } from './../../../domain/master/current-account';
import * as Bluebird from 'bluebird';
import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { CommentNotifyActivity } from '../activities/comment-notify.activity';
import {UserPasswordService} from '../../../services/user-password.service';
import { ErrorSuccessResult } from '../../users/users.types';

@injectable()
@mutation({
    name: 'commentNotify',
    activity: CommentNotifyActivity,
    parameters: [
        { name: 'from', type: String, required: true },
        { name: 'to', type: String, required: true },
        { name: 'dashboardId', type: String }
    ],
    output: { type: ErrorSuccessResult }
})
export class CommentNotifyMutation extends MutationBase<ErrorSuccessResult> {
    constructor(
        @inject(CurrentAccount.name) private _currentAccount: CurrentAccount,
        @inject(UserPasswordService.name) private _userPasswordSvc: UserPasswordService
    ) {
        super();
    }

    async run(data: { from: string, to: string, dashboardId: string }): Promise<ErrorSuccessResult> {
        const from = JSON.parse(data.from);
        const to = JSON.parse(data.to);
        const entry = {
            email: to.emails[0].address,
            companyName: this._currentAccount.get.database.name,
            profile: {
                firstName: to.profile.firstName,
                lastNme: to.profile.lastName
            },
            enrollment: false
        };
        await this._userPasswordSvc.instantiateDependencies(entry, true);
        const result = await this._userPasswordSvc.notifyComment(data);
        return Bluebird.resolve(result);
    }
}
