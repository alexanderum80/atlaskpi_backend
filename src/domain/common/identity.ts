import { IPermission, IRoleDocument } from '../../framework/modules/security/models';

export interface IIdentity {
    accountName: string;
    username: string;
    firstName: string;
    middleName: string;
    lastName: string;
    roles?: [IRoleDocument];
    permissions?: [IPermission];
}