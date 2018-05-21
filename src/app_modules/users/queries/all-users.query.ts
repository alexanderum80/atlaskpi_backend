import { UserService } from '../../../services/user.service';
import * as BlueBird from 'bluebird';
import { inject, injectable } from 'inversify';

import { IUserDocument } from '../../../domain/app/security/users/user';
import { Users } from '../../../domain/app/security/users/user.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { FindAllUsersActivity } from '../activities/find-all-users.activity';
import { User } from '../users.types';

@injectable()
@query({
    name: 'allUsers',
    activity: FindAllUsersActivity,
    parameters: [
        { name: 'filter', type: String },
    ],
    output: { type: User, isArray: true }
})
export class AllUsersQuery implements IQuery<IUserDocument[]> {
    constructor(
        @inject(UserService.name) private _userSvc: UserService,
        @inject(Users.name) private _users: Users
    ) { }

    async run(data: { filter: string }): Promise<IUserDocument[]> {
        // return this._users.model.findAllUsers(data.filter);
        try {
            const promises = [];
            const users = await this._users.model.findAllUsers(data.filter);
            const usersCurrentInfo = await BlueBird.map(users, async (user) => await this._userSvc.getCurrentUserInfo(user));

            return usersCurrentInfo;
        } catch (err) {
            return err;
        }
    }
}
