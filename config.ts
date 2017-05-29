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
    subdomain: string;
}

export const config = {
    masterDb: 'mongodb://localhost/kpibi',
    // masterDb: 'mongodb://kpibi:nLGPxvOzqcBDHBc7@cluster0-shard-00-00-unrxu.mongodb.net:27017,cluster0-shard-00-01-unrxu.mongodb.net:27017,cluster0-shard-00-02-unrxu.mongodb.net:27017/kpibi?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin',
    token: {
        secret: 'jyeu4L?v*FGXmsGAYEXPjp(i',
        expiresIn: '10 d'
    },
    emailService: emailServiceConfig,
    usersService: usersServiceConfig,
    // subdomain: 'd.kpibi.com:4200',
    subdomain: 'app.kpibi.com',
    mongoDbCluster: {
        connectionString: `mongodb://{{user}}:{{password}}@cluster0-shard-00-00-unrxu.mongodb.net:27017,cluster0-shard-00-01-unrxu.mongodb.net:27017,cluster0-shard-00-02-unrxu.mongodb.net:27017/{{database}}?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin`,
        // connectionString: `mongodb://{{user}}:{{password}}@localhost/{{database}}`,
        masterConnectionString: `mongodb://kpibi:nLGPxvOzqcBDHBc7@cluster0-shard-00-00-unrxu.mongodb.net:27017,cluster0-shard-00-01-unrxu.mongodb.net:27017,cluster0-shard-00-02-unrxu.mongodb.net:27017/{{database}}?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin`,
        // masterConnectionString: `mongodb://localhost/{{database}}`,
    },
    mongoDbAtlasApi: {
        username: 'orlando@kpibi.com',
        api_key: '78f3ba05-7679-4e45-8c60-160ad5be992f',
        uri: 'https://cloud.mongodb.com/api/atlas/v1.0/groups/5922e48a9701996b52fc0669/databaseUsers',
    }
};
