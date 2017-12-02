import { AppConnectionPool } from './src/middlewares/app-connection-pool';
import { Container } from 'inversify';


export function bindDependencies(container: Container) {
    container.bind<AppConnectionPool>(AppConnectionPool.name).to(AppConnectionPool).inSingletonScope();
}

