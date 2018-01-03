// This is a must because inversify uses it
import 'reflect-metadata';

import { auth } from './src/app_modules/security/routes/auth';
import { Bridge } from './src/framework/bridge';
import { healthCheck } from './src/middlewares/health-check.middleware';
import { loadUser } from './src/middlewares/load-user.middleware';
import { logger } from './src/middlewares/logger.middleware';
import { tokenValidator } from './src/middlewares/token-validator.middleware';
import { registerDependencies } from './di';
import { me } from './src/app_modules/security/routes/me';
import { AtlasApp } from './src/app_modules/application';
import { initializeConnections } from './src/middlewares/initialize-connections.middleware';
import { integration } from './src/app_modules/integrations/routes';
import { registerValidators } from './src/validators/validatos';

const app = Bridge.create(AtlasApp);

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

// i8n
// i18n.configure({
//     directory: __dirname + '/resources/i18n',
//     defaultLocale: 'en',
//     objectNotation: true
// });
// app.server.use(i18n.init);

// routes
app.server.use('/auth', auth);
app.server.use('/users', me);
app.server.use('/integration', integration);

// start the application
app.start();
