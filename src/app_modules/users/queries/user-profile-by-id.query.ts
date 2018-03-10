import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { UserProfileByIdActivity } from '../activities/user-profile-by-id.activity';
import { UserProfileResolve } from '../users.types';
import { IUserDocument, IUserProfileResolve } from '../../../domain/app/security/users/user';
import { Users } from '../../../domain/app/security/users/user.model';

@injectable()
@query({
    name: 'userProfileById',
    activity: UserProfileByIdActivity,
    parameters: [
        { name: 'id', type: String }
    ],
    output: { type: UserProfileResolve }
})
export class UserProfileByIdQuery implements IQuery<IUserProfileResolve> {
    constructor(
        @inject(Users.name) private _users: Users) { }

    run(data: { id: string}): Promise<IUserProfileResolve> {
        return this._users.model.userProfileById(data.id);
    }
}