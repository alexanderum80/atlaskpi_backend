import { ChartFactory } from './src/app_modules/charts/queries/charts/chart-factory';
import { addModulesRegistrations } from './src/app_modules/di-registrations';
import { IntegrationConnectorFactory } from './src/app_modules/integrations/models/integration-connectors.factory';
import { IntegrationController } from './src/app_modules/integrations/oauth2/oauth2-integration-controller';
import { TwitterIntegrationController } from './src/app_modules/integrations/twitter/twitter-integration-controller';
import { KpiFactory } from './src/app_modules/kpis/queries/kpi.factory';
import { registerConfiguration } from './src/configuration/register-configuration-dependencies';
import { registerAppModels } from './src/domain/app/register-app-models';
import { SocialWidgetFactory } from './src/domain/app/social-widget/social-widget.factory';
import { WidgetFactory } from './src/domain/app/widgets/widget-factory';
import { registerMasterModels } from './src/domain/master/register-master-models';
import { IBridgeContainer } from './src/framework/di/bridge-container';
import { AppConnectionPool } from './src/middlewares/app-connection-pool';
import { registerServices } from './src/services/register-service-dependencies';

export function registerDependencies(container: IBridgeContainer) {
    container.registerSingleton(AppConnectionPool);

    // Integration Registration, in a future move to its own project
    container.registerPerWebRequest(IntegrationConnectorFactory);
    container.registerPerWebRequest(IntegrationController);
    container.registerPerWebRequest(TwitterIntegrationController);

    // Factories
    container.registerPerWebRequest(KpiFactory);
    container.registerPerWebRequest(ChartFactory);
    container.registerPerWebRequest(WidgetFactory);
    container.registerPerWebRequest(SocialWidgetFactory);

    registerConfiguration(container);
    registerMasterModels(container);
    registerAppModels(container);
    registerServices(container);
    addModulesRegistrations(container);
}

