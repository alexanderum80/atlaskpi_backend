import * as mongoose from 'mongoose';
import { LoggerInstance } from 'winston';

import { IIdentity } from '../domain/app/security/users/identity';
import { IUserDocument } from '../domain/app/security/users/user';
import { IBridgeRequest } from '../framework/bridge.request';


/**
 * Extension of the express request object
 */
export interface IExtendedRequest extends IBridgeRequest {

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

    /**
     * logger
     */

    logger: LoggerInstance;

}