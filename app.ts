/*
NODE_ENV="local" AKPI_APP_SUBDOMAIN="d.atlaskpi.com:4200" AKPI_MASTER_DB_URI="mongodb://localhost/kpibi" AKPI_MONGODB_API_USERNAME="orlando@atlaskpi.com" AKPI_NEW_ACCOUNT_DB_URI_FORMAT="mongodb://localhost/{{database}}" AKPI_TOKEN_EXPIRATION="10 d" node app.js
*/

// This is a must because inversify uses it
import 'reflect-metadata';
const timeout = require('connect-timeout');

import * as fileUpload from 'express-fileupload';

import { registerDependencies } from './di';
import { AtlasApp } from './src/app_modules/application';
import { integration } from './src/app_modules/integrations/routes';
import { auth } from './src/app_modules/security/routes/auth';
import { me } from './src/app_modules/security/routes/me';
import { runConfigOverrides } from './src/configuration/run-config-overrides';
import { Bridge } from './src/framework/bridge';
import { healthCheck } from './src/middlewares/health-check.middleware';
import { initializeConnections } from './src/middlewares/initialize-connections.middleware';
import { loadUser } from './src/middlewares/load-user.middleware';
import { logger } from './src/middlewares/logger.middleware';
import { tokenValidator } from './src/middlewares/token-validator.middleware';
import { registerValidators } from './src/validators/validatos';
import { attachments } from './src/app_modules/attachments/attachments.routes';
import { CacheService } from './src/services/cache/cache.service';

const app = Bridge.create(AtlasApp, CacheService);

// override some configurations
runConfigOverrides();

// bind dependencies
registerDependencies(app.Container);

// set custom validators
registerValidators();

// middlewares
app.server.use(timeout('10m'));
app.server.use(healthCheck);
app.server.use(logger);
app.server.use(tokenValidator);
app.server.use(initializeConnections);
app.server.use(loadUser);

// routes
app.server.use('/auth', auth);
app.server.use('/users', me);

app.server.use(fileUpload());
app.server.use('/attachments', attachments);

app.server.use('/integration', integration);

// start the application
app.start();
