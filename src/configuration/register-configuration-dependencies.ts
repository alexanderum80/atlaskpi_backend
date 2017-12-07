import { config } from './config';
import { IAppConfig } from './config-models';
import { Container } from 'inversify';
import { IBridgeContainer } from '../framework/di/bridge-container';

export function registerConfiguration(container: IBridgeContainer): void {
    container.registerConstant('Config', config);
}