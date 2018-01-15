import { IAppServicesConfig } from './app/app-services.config';
import { IEmailServiceConfig } from './email-service.config';
import { IUsersServiceConfig } from './users/users-service-config';


/*

    Environment variables needed

        AKPI_TOKEN_SECRET                -- Used to encrypt and decrypt identity
        AKPI_TOKEN_EXPIRATION            -- Token Expiration date time (https://github.com/zeit/ms)
        AKPI_MASTER_DB_URI               -- Mongodb connection string to master database
        AKPI_NEW_ACCOUNT_DB_URI_FORMAT   -- BD URI used for new accounts creation
        AKPI_APP_SUBDOMAIN               -- Subdomain used for notifications (the link inside)
        AKPI_MONGODB_ADMIN_USERNAME      -- MongoDB username with access to create new users
        AKPI_MONGODB_API_KEY             -- API Key to authenticate agains MongoDB Atlas and create new users
        AKPI_MONGODB_API_URI             -- MongoDB Atlas API URI
        AKPI_INTEGRATION_REDIRECT_URL    -- The enpoint to recieve oauth2 calls

*/

export interface IMongoDBAtlasCredentials {
    username: string;
    api_key: string;
    uri: string;
    groupId: string;
}

export interface ITokenConfig {
    secret: string;
    // https://github.com/zeit/ms
    expiresIn: string;
}

export interface IPnsConfig {
    pnsServer: string;
    appIdentifier: string;
}

export interface IAppConfig {
    impersonateHost: string;
    subdomain: string;
    token: ITokenConfig;
    masterDb: string;
    newAccountEmailNotification: string;
    newAccountDbUriFormat: string;
    mongoDBAtlasCredentials?: IMongoDBAtlasCredentials;
    emailService: IEmailServiceConfig;
    usersService: IUsersServiceConfig;
    appServices: IAppServicesConfig;
    pns: IPnsConfig;
    integrationRedirectUrl: string;
}