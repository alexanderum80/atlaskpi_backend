import * as Promise from 'bluebird';
import { IUserToken } from '../../../domain/app/security/users/user-token';
import { AuthService } from '../../../services/auth.service';
import { injectable, inject } from 'inversify';

@injectable()
export class AuthController {

    constructor(@inject(AuthService.name) private _authservice: AuthService) {}

    authenticateUser(hostname: string, username: string, password: string, ip: string, clientId: string, clientDetails: string): Promise < IUserToken > {
        return this._authservice.authenticateUser({
            hostname: hostname,
            username: username,
            password: password,
            ip: ip,
            clientId: clientId,
            clientDetails: clientDetails
        });
    }
}