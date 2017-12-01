import { Bridge } from './src/framework';
import { AtlasApp } from './src/app_modules/business-units/mutations/mutations.gql';
import { healthCheck, initializeContexts, loadUser, logger, tokenValidator } from './src/middlewares';
import { auth, me } from './routes';
import { DIContainer } from './di';

const app = Bridge.create(AtlasApp, DIContainer);

// middlewares
app.server.use(healthCheck);
app.server.use(logger);
app.server.use(tokenValidator);
app.server.use(initializeContexts);
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
