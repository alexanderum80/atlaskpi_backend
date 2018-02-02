import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { BasicRoleChecker } from '../../../services/security.service';
import { CurrentUser } from '../../../domain/app/current-user';
import { IActivity } from '../../../framework/modules/security/activity';

@injectable()
export class ListAppointmentsActivity implements IActivity {

    constructor(@inject(CurrentUser.name) private _user: CurrentUser) {}

    check(): Promise<boolean> {
        return Promise.resolve(
            BasicRoleChecker.hasPermission(this._user, 'View', 'Appointment')
        );
    }
}

