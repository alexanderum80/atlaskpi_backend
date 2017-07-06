import {
    IEmailServiceConfig,
    emailServiceConfig,
    IUsersServiceConfig,
    usersServiceConfig,
    IAppConfig, IEnvConfig
} from './configuration';

export { IAppConfig } from './configuration';

const prod: IEnvConfig = {
    masterDb: 'mongodb://kpibi:nLGPxvOzqcBDHBc7@cluster0-shard-00-00-unrxu.mongodb.net:27017,cluster0-shard-00-01-unrxu.mongodb.net:27017,cluster0-shard-00-02-unrxu.mongodb.net:27017/kpibi?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin',
    connectionString: `mongodb://{{user}}:{{password}}@cluster0-shard-00-00-unrxu.mongodb.net:27017,cluster0-shard-00-01-unrxu.mongodb.net:27017,cluster0-shard-00-02-unrxu.mongodb.net:27017/{{database}}?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin`,
    masterConnectionString: `mongodb://kpibi:nLGPxvOzqcBDHBc7@cluster0-shard-00-00-unrxu.mongodb.net:27017,cluster0-shard-00-01-unrxu.mongodb.net:27017,cluster0-shard-00-02-unrxu.mongodb.net:27017/{{database}}?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin`,
    subdomain: 'app.kpibi.com',
    isMongoDBAtlas: true,
    mongoDBAtlasCredentials: {
        username: 'orlando@kpibi.com',
        api_key: '78f3ba05-7679-4e45-8c60-160ad5be992f',
        uri: 'https://cloud.mongodb.com/api/atlas/v1.0/groups/5922e48a9701996b52fc0669/databaseUsers',
    }
};

const local: IEnvConfig = {
    masterDb: 'mongodb://localhost/kpibi',
    subdomain: 'd.kpibi.com:4200',
    connectionString: `mongodb://localhost/{{database}}`,
    masterConnectionString: `mongodb://localhost/{{database}}`,
    isMongoDBAtlas: false
};

const prod_localdb: IEnvConfig = {
    masterDb: 'mongodb://localhost/kpibi',
    subdomain: 'app.kpibi.com',
    connectionString: `mongodb://localhost/{{database}}`,
    masterConnectionString: `mongodb://localhost/{{database}}`,
    isMongoDBAtlas: false
};

export const config: IAppConfig = {
    token: {
        secret: 'jyeu4L?v*FGXmsGAYEXPjp(i',
        expiresIn: '10 d'
    },
    emailService: emailServiceConfig,
    usersService: usersServiceConfig,
    // environment: local_tunnel_db
    environment: local,
    // environment: prod
};
