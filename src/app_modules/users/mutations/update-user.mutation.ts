import { Roles } from '../../../domain/app/security/roles';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { MutationBase, mutation } from '../../../framework';
import { Users } from '../../../domain';
import { CreateUserResult, UserDetails } from '../users.types';
import { UpdateUserActivity } from '../activities';

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
export class UpdateUserMutation extends MutationBase<CreateUserResult> {
    constructor(
        @inject('Users') private _users: Users,
        @inject('Roles') private _roles: Roles
    ) {
        super();
    }

    run(data: { id: string, data: UserDetails }): Promise<CreateUserResult> {
        const that = this;

        return this._roles.model.findAllRoles('')
        .then((resp) => {
            return Promise.all(resp)
                .then((r) => {
                    return this._users.model.updateUser(data.id, data.data, r);
                });
        });
    }
}
