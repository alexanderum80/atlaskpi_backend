import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { CurrentUser } from '../../../domain/app/current-user';
import { IActivity } from '../../../framework/modules/security/activity';
import { BasicRoleChecker } from '../../../services/security.service';

@injectable()
export class CreateRoleActivity implements IActivity {

    constructor(@inject(CurrentUser.name) private _currentUser: CurrentUser) {}

    check(): Promise<boolean> {
        BasicRoleChecker.hasPermission(this._currentUser, 'Manage Access Levels', 'Users');
        return Promise.resolve(true);
    }
}