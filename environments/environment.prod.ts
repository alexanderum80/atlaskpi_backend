import { emailServiceConfig, usersServiceConfig } from '../configuration';
import { IAppConfig } from '../configuration/config-models';

export const environmentProd: IAppConfig = {
    token: {
        secret: 'jyeu4L?v*FGXmsGAYEXPjp(i',
        expiresIn: '10 d'
    },
    masterDb: 'mongodb://localhost/kpibi',
    subdomain: 'app.kpibi.com',
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