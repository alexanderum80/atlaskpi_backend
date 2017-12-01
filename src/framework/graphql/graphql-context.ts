import { IAppConfig } from '../../configuration/config-models';
import { IQueryBus } from '../queries';
import { IMutationBus } from '../mutations';
import { Request } from 'express';
import { IExtendedRequest } from '../models';
import { Container } from 'inversify';

export interface IGraphqlContext {
    config: IAppConfig;
    req: IExtendedRequest;
    requestContainer: Container;
    mutationBus: IMutationBus;
    queryBus: IQueryBus;
}
