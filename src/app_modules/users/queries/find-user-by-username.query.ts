import { Roles } from '../../../domain/app/security/roles/role.model';
import { UserService } from '../../../services/user.service';
import { FindUserByUsernameActivity } from '../activities/find-user-by-username.activity';
import { IUserDocument } from '../../../domain/app/security/users/user';
import { IQuery } from '../../../framework/queries/query';
import { User } from '../users.types';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { Users } from '../../../domain/app/security/users/user.model';
import { query } from '../../../framework/decorators/query.decorator';

@injectable()
@query({
    name: 'findByUserName',
    activity: FindUserByUsernameActivity,
    parameters: [
        { name: 'username', type: GraphQLTypesMap.String }
    ],
    output: { type: User }
})
export class FindUserByUsername implements IQuery<IUserDocument> {

    constructor(
        @inject(Roles.name) private _role: Roles,
        @inject(Users.name) private _user: Users,
        @inject(UserService.name) private _userService: UserService) {}

    run(input: { username: string}): Promise<IUserDocument> {
        return this._user.model.findByUsername(input.username);
    }

}