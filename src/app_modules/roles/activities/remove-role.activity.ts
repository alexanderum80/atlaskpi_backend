import { Users } from '../../../domain/app/security/users/user.model';
import { IActivity } from '../../../framework/modules/security/activity';
import * as Promise from 'bluebird';
import { injectable, inject } from 'inversify';

@injectable()
export class RemoveRoleActivity implements IActivity {

    constructor(@inject(Users.name) private _users: Users) {}

    check(): Promise<boolean> {
        // TODO: Refactor
        // const findAdmin = request.user.roles.find(role => {
        //     return (role.name === 'admin') && (role._id.toString() === request.body.variables.id);
        // });
        // const isAdmin = findAdmin === undefined ? BasicRoleChecker.hasPermission(request.user, 'Manage Access Levels', 'Users') : false;
        // cb(null, isAdmin);

        return Promise.resolve(true);
    }
}