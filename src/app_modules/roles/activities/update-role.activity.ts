import { Users } from '../../../domain/app/security/users';
import { IActivity } from '../../../framework';
import * as Promise from 'bluebird';
import { injectable, inject } from 'inversify';

@injectable()
export class UpdateRoleActivity implements IActivity {

    constructor(@inject('Users') private _users: Users) {}

    check(): Promise<boolean> {
        // TODO: Refactor
        // BasicRoleChecker.hasPermission(request.user, 'Manage Access Levels', 'Users')
        return Promise.resolve(true);
    }
}