import { IPermission } from './permission';

export interface IActivity {
    may: String;
    hasPermissions?: IPermission[];
    when?(roles: string[], permission: IPermission[], cb: (err: any, authorized: boolean) => void);
}