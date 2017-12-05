import { Users } from '../../../domain/app/security/users';
import { IActivity } from '../../../framework';
import * as Promise from 'bluebird';
import { injectable, inject } from 'inversify';

@injectable()
export class UpdateTargetActivity implements IActivity {

    constructor(@inject('Users') private _users: Users) {}

    check(): Promise<boolean> {
        // TODO: Refactor
        // const checkAllowed = request.body.variables.data.owner === request.user.username;
        return Promise.resolve(true);
    }
}