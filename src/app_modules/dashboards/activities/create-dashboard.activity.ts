import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IActivity } from '../../../framework/modules/security/activity';
import { CurrentUser } from './../../../domain/app/current-user';
import { BasicRoleChecker } from './../../../services/security.service';

@injectable()
export class CreateDashboardActivity implements IActivity {

    constructor(@inject(CurrentUser.name) private _user: CurrentUser) {}

    check(): Promise<boolean> {
        return Promise.resolve(
            BasicRoleChecker.hasPermission(this._user, 'Create', 'Dashboard')
        );
    }
}