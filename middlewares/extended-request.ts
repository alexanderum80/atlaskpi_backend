import * as mongoose from 'mongoose';
import { IAppConfig } from '../configuration/config-models';
import { IIdentity, IMutationBus, IQueryBus } from '../data';
import { Request } from 'express';
import { IMasterModels, IUserDocument } from '../data/models';
import * as winston from 'winston';

/**
 * Extension of the express request object
 */
export interface ExtendedRequest extends Request, i18nAPI {

    /**
     * Connection to the master database
     */
    masterConnection: mongoose.Connection;

    /**
     * Connection to the customer database
     */
    appConnection: mongoose.Connection;

}