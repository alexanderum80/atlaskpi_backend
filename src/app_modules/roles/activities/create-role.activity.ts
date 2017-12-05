import { BasicRoleChecker } from '../../../services';
import { IUserDocument, Users } from '../../../domain/app/security/users';
import { IActivity } from '../../../framework';
import * as Promise from 'bluebird';
import { injectable, inject } from 'inversify';

@injectable()
export class CreateRoleActivity implements IActivity {

    constructor(@inject('CurrentUser') private _currentUser: IUserDocument) {}

    check(): Promise<boolean> {
        BasicRoleChecker.hasPermission(this._currentUser, 'Manage Access Levels', 'Users');
        return Promise.resolve(true);
    }
}