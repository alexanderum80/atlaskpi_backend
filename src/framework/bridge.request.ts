import { IWebRequestContainerDetails } from './di/bridge-container';
import { Request } from 'Express';

export interface IBridgeRequest extends Request {
    /**
     * Bridge Container
     */
    Container: IWebRequestContainerDetails;

}