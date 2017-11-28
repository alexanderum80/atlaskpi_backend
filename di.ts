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


const container = new Container();

container.bind<IAppConfig>('Config').toConstantValue(config);

export const DIContainer = container;
