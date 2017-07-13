import { IPermission } from '../rbac';
import * as _ from 'lodash';
import { IIdentity } from '../../data/models';

export interface IActivity {
    may: String;
    hasPermissions?: IPermission[];
    when?(identity: IIdentity, cb: (err: any, authorized: boolean) => void);
}

export class ActivityCollection {
    private _activities: IActivity[];
    add(activity: IActivity): void {
        if (!activity) {
            throw { message: 'Activity cannot be null' };
        }
        this._activities.push(activity);
    }
    remove(activity: IActivity) {
        _.remove(this._activities, (a) => { return a === activity; });
    }
}