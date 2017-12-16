import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Roles } from '../../../domain/app/security/roles/role.model';
import { Users } from '../../../domain/app/security/users/user.model';
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
        @inject(Users.name) private _users: Users,
        @inject(Roles.name) private _roles: Roles
    ) {
        super();
    }

    run(data: { id: string, data: UserDetails }): Promise<IMutationResponse> {
        const that = this;

        return this._roles.model.findAllRoles('')
        .then((resp) => {
            return this._users.model.updateUser(data.id, data.data, resp);
        });
    }
}
