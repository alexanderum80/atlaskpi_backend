import { Users } from '../../../domain/app/security/users/user.model';
import { IActivity } from '../../../framework/modules/security/activity';
import * as Promise from 'bluebird';
import { injectable, inject } from 'inversify';

@injectable()
export class UpdateWidgetActivity implements IActivity {

    constructor(@inject(Users.name) private _users: Users) {}

    check(): Promise<boolean> {
        // TODO: Refactor
        // BasicRoleChecker.hasPermission(request.user, 'Update', 'Widget')
        return Promise.resolve(true);
    }
}