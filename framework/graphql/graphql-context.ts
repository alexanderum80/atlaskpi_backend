import { IAppConfig } from '../../configuration/config-models';
import { IQueryBus } from '../queries';
import { IMutationBus } from '../mutations';

import { ExtendedRequest } from '../middlewares';

export interface IGraphqlContext {
    config: IAppConfig;
    req: ExtendedRequest;
    mutationBus: IMutationBus;
    queryBus: IQueryBus;
}
