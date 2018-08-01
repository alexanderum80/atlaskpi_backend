import { appServicesConfig } from './app/app-services.config';
import { IAppConfig } from './config-models';
import { emailServiceConfig } from './email-service.config';
import { usersServiceConfig } from './users/users-service-config';

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

        AKPI_INTEGRATION_REDIRECT_URL    -- The enpoint to recieve oauth2 calls

            Ex: "https://api.atlaskpi.com:9091/integration"

        AKPI_SEED_DB_NAME                -- Database name to copy seed data from

            Ex: "newdemo"

*/

export const config: IAppConfig = {
    impersonateHost: null,
    // impersonateHost: 'orlando.d.atlaskpi.com',
    subdomain: process.env.AKPI_APP_SUBDOMAIN || 'dev.atlaskpi.com',
    token: {
        secret: process.env.AKPI_TOKEN_SECRET || 'jyeu4L?v*FGXmsGAYEXPjp(i',
        expiresIn: process.env.AKPI_TOKEN_EXPIRATION || '90 d'
    },
    masterDb: process.env.AKPI_MASTER_DB_URI || 'mongodb://localhost/kpibi',
    newAccountEmailNotification: process.env.NEW_ACCOUNT_EMAIL_NOTIFICATION || 'new-accounts@atlaskpi.com',
    newAccountDbUriFormat: process.env.AKPI_NEW_ACCOUNT_DB_URI_FORMAT || 'mongodb://localhost/{{database}}',
    mongoDBAtlasCredentials: {
        username: process.env.AKPI_MONGODB_API_USERNAME || '',
        api_key: process.env.AKPI_MONGODB_API_KEY || '',
        uri: process.env.AKPI_MONGODB_API_URI || '',
        groupId: process.env.AKPI_MONGODB_GROUP_ID || ''
    },
    emailService: emailServiceConfig,
    usersService: usersServiceConfig,
    appServices: appServicesConfig,
    pns: {
        pnsServer: process.env.AKPI_PNS_SERVER || 'http://pns.test.atlaskpi.com:9093',
        appIdentifier: process.env.AKPI_PNS_APP_IDENTIFIER || 'GpINyWutMVBCRRAgo7Cv0SZ9sQI34pgW'
    },
    scheduler: {
        server: process.env.AKPI_SCHEDULER_SERVER || 'http://scheduler.atlaskpi.com:9100',
        secret: process.env.AKPI_APP_SECRET || 'aZ6ELVzTxAXNFrq7yWahQXPya3Kng2zW'
    },
    // integrationRedirectUrl: process.env.AKPI_INTEGRATION_REDIRECT_URL  || 'https://af31c66b.ngrok.io/integration'
    integrationRedirectUrl: process.env.AKPI_INTEGRATION_REDIRECT_URL  || 'http://localhost:9091/integration',
    aws: {
        accessKeyId: process.env.AKPI_AWS_ACCESSKEY_ID || 'AKIAIFEP6XNL3HGHDRCQ',
        secretAccessKey: process.env.AKPI_AWS_SECRET_ACCESS_KEY || '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'
    },
    cache: {
        redisServer: process.env.AKPI_REDIS_SERVER || '35.172.178.73',
        redisPort: process.env.AKPI_REDIS_PORT || '6379'
    },
    supportEmail: process.env.SUPPORT_EMAIL || 'support@atlaskpi.com',
    seedDbName: process.env.AKPI_SEED_DB_NAME || 'newdemo'
};