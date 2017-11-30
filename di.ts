import { Container } from 'inversify';

// import { config } from './config';
// import { IAppConfig } from './configuration/index';

interface IAppConfig {
    key: string;
    value: string;
}

const config: IAppConfig = {
    key: 'key',
    value: 'value'
};

export function registerDependencies(container: Container) {
    container.bind<IAppConfig>('Config').toConstantValue(config);
}

