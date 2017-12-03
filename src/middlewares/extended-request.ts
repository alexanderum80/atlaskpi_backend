import { Request } from 'Express';
import * as mongoose from 'mongoose';
import { IIdentity } from '../domain/app/security/users/identity';

/**
 * Extension of the express request object
 */
export interface ExtendedRequest extends Request {

    /**
     * User's identity
     */
    identity: IIdentity;
    /**
     * Connection to the master database
     */
    masterConnection: mongoose.Connection;

    /**
     * Connection to the customer database
     */
    appConnection: mongoose.Connection;

}