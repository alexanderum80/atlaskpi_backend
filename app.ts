// This is a must because inversify uses it
import 'reflect-metadata';

import { registerDependencies } from './di';
import { AtlasApp } from './src/app_modules/application';
import { Bridge } from './src/framework/bridge';
import { healthCheck } from './src/middlewares/health-check.middleware';
import { initializeConnections } from './src/middlewares/initialize-connections.middleware';
import { loadUser } from './src/middlewares/load-user.middleware';
import { logger } from './src/middlewares/logger.middleware';
import { tokenValidator } from './src/middlewares/token-validator.middleware';
import { auth } from './src/app_modules/security/routes/auth';
import { me } from './src/app_modules/security/routes/me';

const app = Bridge.create(AtlasApp);

// bind dependencies
registerDependencies(app.Container);

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

// start the application
app.start();
