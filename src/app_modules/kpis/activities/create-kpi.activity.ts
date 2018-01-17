import { BasicRoleChecker } from '../../../services/security.service';
import { CurrentUser } from '../../../domain/app/current-user';
import { IActivity } from '../../../framework/modules/security/activity';
import * as Promise from 'bluebird';
import { injectable, inject } from 'inversify';

@injectable()
export class CreateKPIActivity implements IActivity {

    constructor(@inject(CurrentUser.name) private _user) {}

    check(): Promise<boolean> {
        return Promise.resolve(
            BasicRoleChecker.hasPermission(this._user, 'Create', 'KPI')
        );
    }
}