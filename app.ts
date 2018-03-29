// This is a must because inversify uses it
import 'reflect-metadata';

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

const app = Bridge.create(AtlasApp);

// override some configurations
runConfigOverrides();

// bind dependencies
registerDependencies(app.Container);

// set custom validators
registerValidators();

// middlewares
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
