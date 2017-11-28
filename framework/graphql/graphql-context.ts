import { IAppConfig } from '../../configuration/config-models';
import { IQueryBus } from '../queries';
import { IMutationBus } from '../mutations';
import { Request } from 'express';
import { IExtendedRequest } from '../models';

export interface IGraphqlContext {
    config: IAppConfig;
    req: IExtendedRequest;
    mutationBus: IMutationBus;
    queryBus: IQueryBus;
}
