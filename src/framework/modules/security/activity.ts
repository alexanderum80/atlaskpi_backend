// import { IPermission } from './permission';
import * as Promise from 'bluebird';

// export interface IActivity {
//     may: String;
//     hasPermissions?: IPermission[];
//     when?(roles: string[], permission: IPermission[], cb: (err: any, authorized: boolean) => void);
// }

export interface IActivity {
    check(): Promise<boolean>;
}
