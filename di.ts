import { Container } from 'inversify';

import { config } from './config';
import { IAppConfig } from './configuration/index';

const container = new Container();

container.bind<IAppConfig>('Config').toConstantValue(config);

export const DIContainer = container;
