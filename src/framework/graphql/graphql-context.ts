import { IExtendedRequest } from '../../middlewares/extended-request';
import { IAppConfig } from '../../configuration/config-models';
import { IQueryBus } from '../queries';
import { IMutationBus } from '../mutations';
import { Request } from 'express';
import { Container } from 'inversify';
import { IWebRequestContainerDetails } from '../di/bridge-container';

export interface IGraphqlContext {
    config: IAppConfig;
    req: IExtendedRequest;
    requestContainer: IWebRequestContainerDetails;
    mutationBus: IMutationBus;
    queryBus: IQueryBus;
}
