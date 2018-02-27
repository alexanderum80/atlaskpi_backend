import { UserService } from '../../../services/user.service';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { ICreateUserDetails } from '../../../domain/common/create-user';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { CreateUserActivity } from '../activities/create-user.activity';
import { CreateUserResult, UserDetails } from '../users.types';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';

@injectable()
@mutation({
    name: 'createUser',
    activity: CreateUserActivity,
    parameters: [
        { name: 'data', type: UserDetails },
    ],
    output: { type: CreateUserResult }
})
export class CreateUserMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(UserService.name) private _userService: UserService) {
        super();
    }

    run(input: { data: ICreateUserDetails}): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._userService.createUser(input.data).then(result => {
                resolve(result);
                return;
            }).catch(err => {
                reject(err);
                return;
            });
        });
    }
}
