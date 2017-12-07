import { INotify } from '../../../models/app/targets/ITarget';
import { IUserModel } from '../../../models/app/users/index';
import { IIdentity } from '../../../models/app/identity';
import { QueryBase } from '../..';
import * as Promise from 'bluebird';

export class TestTargetNotificationQuery extends QueryBase<any> {
    constructor(public identity: IIdentity,
                private _testNotification: any,
                private _user: IUserModel) {
        super(identity);
    }

    run(data: { input: {id: string[], targetId: string}}): Promise<any> {
        const that = this;
        const input = data.input;
        return new Promise<any>((resolve, reject) => {
            that._user.findUsersById(input.id).then(users => {
                users.forEach(user => {
                    that._testNotification.notify(user, user.username, { id: input.targetId });
                });
            });
        });
    }
}