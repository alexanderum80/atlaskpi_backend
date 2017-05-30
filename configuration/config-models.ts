import { IEmailServiceConfig }from './email-service.config';
import { IUsersServiceConfig } from './users';

export interface IMongoDBAtlasCredentials {
    username: string;
    api_key: string;
    uri: string;
}

export interface IEnvConfig {
    masterDb: string;
    subdomain: string;
    connectionString: string;
    masterConnectionString: string;
    isMongoDBAtlas: boolean;
    mongoDBAtlasCredentials?: IMongoDBAtlasCredentials;
}

export interface IAppConfig {
    token: {
        secret: string;
        // https://github.com/zeit/ms
        expiresIn: string | number;
    };
    emailService: IEmailServiceConfig;
    usersService: IUsersServiceConfig;
    environment: IEnvConfig;
}