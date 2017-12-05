import { Users } from '../../../domain/app/security/users';
import { IActivity } from '../../../framework';
import * as Promise from 'bluebird';
import { injectable, inject } from 'inversify';

@injectable()
export class CreateTargetActivity implements IActivity {

    constructor(@inject('Users') private _users: Users) {}

    check(): Promise<boolean> {
        // TODO: Refactor
        // BasicRoleChecker.hasPermission(request.user, 'Set', 'Targets')
        return Promise.resolve(true);
    }
}