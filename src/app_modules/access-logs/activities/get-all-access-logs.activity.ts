import { Users } from '../../../domain/app/security/users';
import { IActivity } from '../../../framework/modules/security/activity';
import * as Promise from 'bluebird';
import { injectable, inject } from 'inversify';

@injectable()
export class GetAllAccessLogsActivity implements IActivity {

    constructor(@inject('Users') private _users: Users) {}

    check(): Promise<boolean> {
        return Promise.resolve(true);
    }

}
