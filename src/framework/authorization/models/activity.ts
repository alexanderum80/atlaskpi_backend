import { ExtendedRequest } from '../../middlewares';
import { IPermission } from './permission';

export interface IActivity {
    may: String;
    hasPermissions?: IPermission[];
    when?(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void);
}