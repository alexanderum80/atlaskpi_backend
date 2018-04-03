import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { CurrentUser } from '../../../domain/app/current-user';
import { IUserDocument } from '../../../domain/app/security/users/user';
import { Users } from '../../../domain/app/security/users/user.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { FindUserByIdActivity } from '../activities/find-user-by-id.activity';
import { User } from '../users.types';
import { UserService } from '../../../services/user.service';

@injectable()
@query({
    name: 'User',
    activity: FindUserByIdActivity,
    parameters: [
        { name: 'id', type: String },
    ],
    output: { type: User }
})
export class UserQuery implements IQuery<IUserDocument> {
    constructor(
        @inject(UserService.name) private _users: UserService
    ) { }

    run(data: { id: string }): Promise<IUserDocument> {
        return new Promise<IUserDocument>((resolve,  reject) => {
            this._users.getCurrentUserInfo().then(u => {
                resolve(u);
            }).catch(e => reject(e));
        });

        // return this._users.getCurrentUserInfo();

        // // If not id specified return the own user
        // if (!data || !data.id) {
        //     return Promise.resolve(this._currentUser.get().toObject() as IUserDocument);
        // }
        // return this._users.model.findUserById(data.id);
    }
}
