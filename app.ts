// This is a must because inversify uses it
import 'reflect-metadata';

import { auth } from './src/app_modules/security/routes';
import { Bridge } from './src/framework';
import { healthCheck, loadUser, logger, tokenValidator } from './src/middlewares';
import { bindDependencies } from './di';
import { me } from './src/app_modules/security/index';
import { AtlasApp } from './src/app_modules';

const app = Bridge.create(AtlasApp);

// bind dependencies
bindDependencies(app.Container);

// middlewares
app.server.use(healthCheck);
app.server.use(logger);
app.server.use(tokenValidator);
app.server.use(loadUser);

// i8n
i18n.configure({
    directory: __dirname + '/resources/i18n',
    defaultLocale: 'en',
    objectNotation: true
});
app.server.use(i18n.init);

// routes
app.server.use('/auth', auth);
app.server.use('/users', me);

// start the application
app.start();
