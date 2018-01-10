import { IWebRequestContainerDetails } from './di/bridge-container';
import { Request } from 'express';

export interface IBridgeRequest extends Request {
    /**
     * Bridge Container
     */
    Container: IWebRequestContainerDetails;

}