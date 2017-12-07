import { ChartFactory } from './src/app_modules/charts/queries/charts/chart-factory';
import { IUserDocument } from './src/domain/app/security/users';
import { Winston } from 'winston';
import { registerMasterModels } from './src/domain/master/register-master-models';
import { registerAppModels } from './src/domain/app/register-app-models';
import { registerConfiguration } from './src/configuration/register-configuration-dependencies';
import { registerServices } from './src/services/register-service-dependencies';
import { AppConnectionPool } from './src/middlewares/app-connection-pool';
import { Container } from 'inversify';
import * as logger from 'winston';
import { BridgeContainer, IBridgeContainer } from './src/framework/di/bridge-container';
import { IExtendedRequest } from './src/middlewares/index';
import { injectable, inject } from 'inversify';
import { KpiFactory } from './src/app_modules/kpis/queries/index';
import { WidgetFactory } from './src/domain/app/widgets/widget-factory';

@injectable()
export class CurrentUser {
    private _user: IUserDocument;

    constructor(@inject('Request') req: IExtendedRequest) {
        this._user = req.user;
    }

    get(): IUserDocument {
        return this._user;
    }
}


export function registerDependencies(container: IBridgeContainer) {
    container.registerConstant('logger', logger);

    container.registerSingleton(AppConnectionPool);
    container.registerPerWebRequest(CurrentUser);

    container.registerPerWebRequest(KpiFactory);
    container.registerPerWebRequest(ChartFactory);
    container.registerPerWebRequest(WidgetFactory);

    registerConfiguration(container);
    registerMasterModels(container);
    registerAppModels(container);
    registerServices(container);
}

