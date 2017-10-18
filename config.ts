import { IAppConfig } from './configuration';
import { emailServiceConfig, usersServiceConfig, appServicesConfig } from './configuration';

/*

    Environment variables needed

        AKPI_TOKEN_SECRET                -- Used to encrypt and decrypt identity

            Ex: "jyeu4L?v*FGXmsGAYEXPjp(i"

        AKPI_TOKEN_EXPIRATION            -- Token Expiration date time (https://github.com/zeit/ms)

            Ex: "10 d"

        AKPI_MASTER_DB_URI               -- Mongodb connection string to master database

            Ex: "mongodb://admin:PASSWORD@atlaskpi-shard-00-00-gwrnu.mongodb.net:27017,atlaskpi-shard-00-01-gwrnu.mongodb.net:27017,atlaskpi-shard-00-02-gwrnu.mongodb.net:27017/DATABASE?ssl=true&replicaSet=AtlasKPI-shard-0&authSource=admin"

        AKPI_NEW_ACCOUNT_DB_URI_FORMAT   -- BD URI used for new accounts creation

            Ex: "mongodb://{{username}}:{{password}}@atlaskpi-shard-00-00-gwrnu.mongodb.net:27017,atlaskpi-shard-00-01-gwrnu.mongodb.net:27017,atlaskpi-shard-00-02-gwrnu.mongodb.net:27017/{{database}}?ssl=true&replicaSet=AtlasKPI-shard-0&authSource=admin"

        AKPI_APP_SUBDOMAIN               -- Subdomain used for notifications (the link inside)

            Ex: "bi.atlaskpi.com"

        AKPI_MONGODB_ADMIN_USERNAME      -- MongoDB username with access to create new users

            Ex: "orlando@atlaskpi.com"

        AKPI_MONGODB_API_KEY             -- API Key to authenticate agains MongoDB Atlas and create new users

            Ex: ""

        AKPI_MONGODB_API_URI             -- MongoDB Atlas API URI

            Ex: "https://cloud.mongodb.com/"

        AKPI_MONGODB_GROUP_ID            -- Group ID used for API CALLS

            Ex: "872623874hdfh734646d222"

*/

export const config: IAppConfig = {
    impersonateHost: null,
    subdomain: process.env.AKPI_APP_SUBDOMAIN || 'd.atlaskpi.com',
    token: {
        secret: process.env.AKPI_TOKEN_SECRET || 'jyeu4L?v*FGXmsGAYEXPjp(i',
        expiresIn: process.env.AKPI_TOKEN_EXPIRATION || '90 d'
    },
    masterDb: process.env.AKPI_MASTER_DB_URI || 'mongodb://localhost/kpibi',
    newAccountDbUriFormat: process.env.AKPI_NEW_ACCOUNT_DB_URI_FORMAT || 'mongodb://localhost/{{database}}',
    mongoDBAtlasCredentials: {
        username: process.env.AKPI_MONGODB_API_USERNAME || '',
        api_key: process.env.AKPI_MONGODB_API_KEY || '',
        uri: process.env.AKPI_MONGODB_API_URI || '',
        groupId: process.env.AKPI_MONGODB_GROUP_ID || ''
    },
    emailService: emailServiceConfig,
    usersService: usersServiceConfig,
    appServices: appServicesConfig
};
