import { IAppConfig } from '../configuration/config-models';
import { emailServiceConfig, usersServiceConfig } from '../configuration';

export const environment: IAppConfig = {
    token: {
        secret: 'jyeu4L?v*FGXmsGAYEXPjp(i',
        expiresIn: '10 d'
    },
    masterDb: 'mongodb://localhost/kpibi',
    subdomain: 'd.kpibi.com:4200',
    connectionString: `mongodb://localhost/{{database}}`,
    masterConnectionString: `mongodb://localhost/{{database}}`,
    emailService: emailServiceConfig,
    usersService: usersServiceConfig,
    isMongoDBAtlas: false,
    mongoDBAtlasCredentials: {
        username: '',
        api_key: '',
        uri: ''
    }
};