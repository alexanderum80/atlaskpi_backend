import { IRoleDocument } from '../roles/role';
import { IPermission } from '../../../../framework/modules/security/permission';

export interface IIdentity {
    accountName: string;
    username: string;
    firstName: string;
    middleName: string;
    lastName: string;
    roles?: [IRoleDocument];
    permissions?: [IPermission];
}