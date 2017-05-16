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
    masterDb: 'mongodb://localhost/kpibi',
    token: {
        secret: 'jyeu4L?v*FGXmsGAYEXPjp(i',
        expiresIn: '10 d'
    },
    emailService: emailServiceConfig,
    usersService: usersServiceConfig
};
