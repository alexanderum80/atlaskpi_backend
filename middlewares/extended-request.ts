import { IAppConfig } from '../config';
import { IIdentity, IMutationBus, IQueryBus } from '../data';
import { Request } from 'express';
import { IAppModels, IMasterModels, IUserDocument } from '../data/models';
import * as winston from 'winston';

/**
 * Extension of the express request object
 */
export interface ExtendedRequest extends Request, i18nAPI {

    /**
     * Value mainly used for testing multiple accounts
     */
    subdomain: string;

    /**
     * Application configuration
     */
    config: IAppConfig;

    /**
     * User identity. This will be populated only when the user request contains a token
     */
    identity: IIdentity;

    /**
     * Master database context which allow access to all master schemas on a multitenant application
     */
    masterContext: IMasterModels;

    /**
     * Populated also when a token was provided and gives access to all application models
     * for this account
     */
    appContext: IAppModels;

    /**
     * Logger instance that could be used to have some information logged to a local file or the console
     */
    logger: winston.LoggerInstance;

    /**
     * The mutation bus associated to provided account through the user token
     */
    mutationBus: IMutationBus;

    /**
     * The mutation bus associated to provided account through the user token
     */
    queryBus: IQueryBus;

    /**
     * The user whi is running this request
     */
    user: IUserDocument;

}