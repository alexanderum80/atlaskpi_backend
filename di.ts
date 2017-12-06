import { Winston } from 'winston';
import { registerMasterModels } from './src/domain/master/register-master-models';
import { registerAppModels } from './src/domain/app/register-app-models';
import { registerConfiguration } from './src/configuration/register-configuration-dependencies';
import { registerServices } from './src/services/register-service-dependencies';
import { AppConnectionPool } from './src/middlewares/app-connection-pool';
import { Container } from 'inversify';
import * as logger from 'winston';


export function registerDependencies(container: Container) {
    container.bind<AppConnectionPool>(AppConnectionPool.name).to(AppConnectionPool).inSingletonScope();
    container.bind<Winston>('logger').toConstantValue(logger);

    registerConfiguration(container);
    registerMasterModels(container);
    registerAppModels(container);
    registerServices(container);
}

