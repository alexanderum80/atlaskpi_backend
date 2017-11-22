import { IUser, IUserEmail, IUserServices, IUserProfile } from './IUser';
import { IRoleDocument } from '../../../../lib/rbac';

export class User implements IUser {
    username: string;
    password?: string;
    emails: IUserEmail[];
    services?: IUserServices;
    profile: IUserProfile;
    roles?: IRoleDocument[];

    static createUser() {
    }

}