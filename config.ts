import { environment, environmentProd } from './environments';
import { IAppConfig } from './configuration';

export const config: IAppConfig = process.env.NODE_ENV === 'prod' ? environmentProd : environment;
