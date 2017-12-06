import { AppConfig, config } from './config';
import { IAppConfig } from './config-models';
import { Container } from 'inversify';

export function registerConfiguration(container: Container): void {
    container.bind<IAppConfig>('Config').to(AppConfig).inSingletonScope();
}