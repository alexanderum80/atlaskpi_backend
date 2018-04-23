import { Users } from '../../../domain/app/security/users/user.model';
import { IActivity } from '../../../framework/modules/security/activity';
import * as Promise from 'bluebird';
import { injectable, inject } from 'inversify';

@injectable()
export class FindTargetByIdActivity implements IActivity {

    constructor(@inject(Users.name) private _users: Users) {}

    check(): Promise<boolean> {
        return Promise.resolve(true);
    }
}