import { AppConfig, config } from './config';
import { IAppConfig } from './config-models';
import { Container } from 'inversify';
import { BridgeContainer } from '../framework/di/bridge-container';

export function registerConfiguration(container: BridgeContainer): void {
    container.registerConstant('Config', AppConfig);
}