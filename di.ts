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
    container.registerSingleton(AppConnectionPool);
    container.registerConstant('logger', logger);
    container.registerPerWebRequest(CurrentUser);

    registerConfiguration(container);
    registerMasterModels(container);
    registerAppModels(container);
    registerServices(container);
}

