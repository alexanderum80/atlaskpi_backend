import { IQueryBus } from '../queries';
import { IMutationBus } from '../mutations/mutation-bus';
import { IAppConfig } from '../../config';
import { ExtendedRequest } from '../../middlewares';

export interface IGraphqlContext {
    config: IAppConfig;
    req: ExtendedRequest;
    mutationBus: IMutationBus;
    queryBus: IQueryBus;
}