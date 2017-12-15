import { Request } from 'Express';
import * as mongoose from 'mongoose';

import { IIdentity } from '../domain/app/security/users/identity';
import { IUserDocument } from '../domain/app/security/users/user';
import { IWebRequestContainerDetails } from '../framework/di/bridge-container';


/**
 * Extension of the express request object
 */
export interface IExtendedRequest extends Request {

    /**
     * Bridge Container
     */
    container: IWebRequestContainerDetails;

    /**
     * User's identity
     */
    identity: IIdentity;

    /**
     * Current User
     */
    user: IUserDocument;

    /**
     * Connection to the master database
     */
    masterConnection: mongoose.Connection;

    /**
     * Connection to the customer database
     */
    appConnection: mongoose.Connection;

}