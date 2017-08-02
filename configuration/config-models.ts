import { ITokenInfo } from '../data/models/app/users';
import { IEmailServiceConfig }from './email-service.config';
import { IUsersServiceConfig } from './users';

export interface IMongoDBAtlasCredentials {
    username: string;
    api_key: string;
    uri: string;
}

export interface ITokenConfig {
    secret: string;
    // https://github.com/zeit/ms
    expiresIn: string;
}

export interface IAppConfig {
    token: ITokenConfig;
    masterDb: string;
    subdomain: string;
    connectionString: string;
    masterConnectionString: string;
    emailService: IEmailServiceConfig;
    usersService: IUsersServiceConfig;
    isMongoDBAtlas: boolean;
    mongoDBAtlasCredentials?: IMongoDBAtlasCredentials;
}