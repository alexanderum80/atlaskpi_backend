import { IActivity } from '../../../framework/modules/security/activity';
import * as Promise from 'bluebird';
import { injectable, inject } from 'inversify';
import { BasicRoleChecker } from '../../../services/security.service';
import { CurrentUser } from '../../../domain/app/current-user';

@injectable()
export class UpdateAlertActivity implements IActivity {

    constructor(@inject(CurrentUser.name) private _user: CurrentUser) {}

    check(): Promise<boolean> {
        return Promise.resolve(
            BasicRoleChecker.hasPermission(this._user, 'Modify', 'Alert')
        );
    }
}
