import { inject, injectable } from 'inversify';

import { ChartFactory } from './src/app_modules/charts/queries/charts/chart-factory';
import { KpiFactory } from './src/app_modules/kpis/queries/kpi.factory';
import { registerConfiguration } from './src/configuration/register-configuration-dependencies';
import { registerAppModels } from './src/domain/app/register-app-models';
import { IUserDocument } from './src/domain/app/security/users/user';
import { WidgetFactory } from './src/domain/app/widgets/widget-factory';
import { registerMasterModels } from './src/domain/master/register-master-models';
import { IBridgeContainer } from './src/framework/di/bridge-container';
import { AppConnectionPool } from './src/middlewares/app-connection-pool';
import { IExtendedRequest } from './src/middlewares/extended-request';
import { registerServices } from './src/services/register-service-dependencies';
import { LoggerInstance, LogCallback } from 'winston';


export function registerDependencies(container: IBridgeContainer) {
    container.registerSingleton(AppConnectionPool);

    container.registerPerWebRequest(KpiFactory);
    container.registerPerWebRequest(ChartFactory);
    container.registerPerWebRequest(WidgetFactory);

    registerConfiguration(container);
    registerMasterModels(container);
    registerAppModels(container);
    registerServices(container);
}

