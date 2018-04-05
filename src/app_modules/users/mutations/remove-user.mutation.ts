import { UserService } from '../../../services/user.service';
// import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { RemoveUserActivity } from '../activities/remove-user.activity';
import { CreateUserResult } from '../users.types';

@injectable()
@mutation({
    name: 'removeUser',
    activity: RemoveUserActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: CreateUserResult }
})
export class RemoveUserMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(UserService.name) private _userSvc: UserService) {
        super();
    }

    async run(data: { id: string }): Promise<IMutationResponse> {
        return await this._userSvc.removeUser(data.id);
    }
}
