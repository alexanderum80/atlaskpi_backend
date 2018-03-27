import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { Users } from '../../../domain/app/security/users/user.model';
import { GetUseravatarAddressActivity } from '../activities/get-user-avatar-address.activity';

@injectable()
@query({
    name: 'getUserAvatarAddress',
    activity: GetUseravatarAddressActivity,
    parameters: [
        { name: 'id', type: String }
    ],
    output: { type: String }
})
export class GetUserAvatarAddressQuery implements IQuery<string> {
    constructor(
        @inject(Users.name) private _users: Users) { }

    run(data: { id: string}): Promise<string> {
        return this._users.model.getUserAvatarAddress(data.id);
    }
}