import { UserService } from '../../../services/user.service';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { UpdateUserActivity } from '../activities/update-user.activity';
import { CreateUserResult, UserDetails } from '../users.types';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';

@injectable()
@mutation({
    name: 'updateUser',
    activity: UpdateUserActivity,
    parameters: [
        { name: 'id', type: String, required: true },
        { name: 'data', type: UserDetails },
    ],
    output: { type: CreateUserResult }
})
export class UpdateUserMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(UserService.name) private _userService: UserService
    ) {
        super();
    }

    run(data: { id: string, data: UserDetails }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._userService.updateUser(data).then(res => {
                resolve(res);
            }).catch(err => reject(err));
        });
    }
}
