import { config } from '../../configuration/config';
import { IAppConfig } from '../../configuration/config-models';
import { IExtendedRequest } from '../../middlewares/extended-request';
import { IWebRequestContainerDetails } from '../di/bridge-container';
import { IMutationBus } from '../mutations/mutation-bus';
import { IQueryBus } from '../queries/query-bus';


export interface IGraphqlContext {
    config: IAppConfig;
    req: IExtendedRequest;
    requestContainer: IWebRequestContainerDetails;
    mutationBus: IMutationBus;
    queryBus: IQueryBus;
}
