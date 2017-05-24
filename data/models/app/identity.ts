import { IPermission, IRole } from '../../../lib/rbac';

export interface IIdentity {
    username: string;
    firstName: string;
    middleName: string;
    lastName: string;
    roles?: string[];
    permissions?: [IPermission];
    dbUri: string;
}