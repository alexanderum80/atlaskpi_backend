import {
    IEmailServiceConfig,
    emailServiceConfig,
    IUsersServiceConfig,
    usersServiceConfig
} from './configuration';

export interface IAppConfig {
    masterDb: string;
    token: {
        secret: string;
        // https://github.com/zeit/ms
        expiresIn: string | number;
    };
    emailService: IEmailServiceConfig;
    usersService: IUsersServiceConfig;
}

export const config = {
    masterDb: 'mongodb://kpibi:nLGPxvOzqcBDHBc7@cluster0-shard-00-00-unrxu.mongodb.net:27017,cluster0-shard-00-01-unrxu.mongodb.net:27017,cluster0-shard-00-02-unrxu.mongodb.net:27017/kpibi?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin',
    token: {
        secret: 'jyeu4L?v*FGXmsGAYEXPjp(i',
        expiresIn: '10 d'
    },
    emailService: emailServiceConfig,
    usersService: usersServiceConfig
};
