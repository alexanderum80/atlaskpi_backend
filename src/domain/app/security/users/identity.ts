import { IRoleDocument } from '../roles';
import { IPermission } from '../../../../framework/index';

export interface IIdentity {
    accountName: string;
    username: string;
    firstName: string;
    middleName: string;
    lastName: string;
    roles?: [IRoleDocument];
    permissions?: [IPermission];
}