import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Users } from '../../../domain/app/security/users';
import { IActivity } from '../../../framework';

@injectable()
export class EndOfDayReportActivity implements IActivity {

    constructor(@inject('Users') private _users: Users) {}

    check(): Promise<boolean> {
        return Promise.resolve(true);
    }
}
