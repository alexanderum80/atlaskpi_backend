import { AppConnectionPool } from './src/middlewares/app-connection-pool';
import { ChartFactory } from './src/app_modules/charts/queries/charts/chart-factory';
import { Winston } from 'winston';
import { SocialWidgetFactory } from './src/domain/app/social-widget/social-widget.factory';
import { registerMasterModels } from './src/domain/master/register-master-models';
import { registerAppModels } from './src/domain/app/register-app-models';
import { registerConfiguration } from './src/configuration/register-configuration-dependencies';
import { registerServices } from './src/services/register-service-dependencies';
import { Container } from 'inversify';
import * as logger from 'winston';
import { BridgeContainer, IBridgeContainer } from './src/framework/di/bridge-container';
import { IExtendedRequest } from './src/middlewares/extended-request';
import { injectable, inject } from 'inversify';
import { KpiFactory } from './src/app_modules/kpis/queries/kpi.factory';
import { WidgetFactory } from './src/domain/app/widgets/widget-factory';


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

