import { Users } from '../../../domain/app/security/users/user.model';
import { IActivity } from '../../../framework/modules/security/activity';
import * as Promise from 'bluebird';
import { injectable, inject } from 'inversify';

@injectable()
export class CreateWidgetActivity implements IActivity {

    constructor(@inject(Users.name) private _users: Users) {}

    check(): Promise<boolean> {
        // TODO: Refactor
        // BasicRoleChecker.hasPermission(request.user, 'Create', 'Widget')
        return Promise.resolve(true);
    }
}