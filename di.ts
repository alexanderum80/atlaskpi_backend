import { Winston } from 'winston';
import { registerMasterModels } from './src/domain/master/register-master-models';
import { registerAppModels } from './src/domain/app/register-app-models';
import { registerConfiguration } from './src/configuration/register-configuration-dependencies';
import { registerServices } from './src/services/register-service-dependencies';
import { AppConnectionPool } from './src/middlewares/app-connection-pool';
import { Container } from 'inversify';
import * as logger from 'winston';
import { BridgeContainer } from './src/framework/di/bridge-container';


export function registerDependencies(container: BridgeContainer) {
    container.registerSingleton(AppConnectionPool);
    container.registerConstant('logger', logger);

    registerConfiguration(container);
    registerMasterModels(container);
    registerAppModels(container);
    registerServices(container);
}

