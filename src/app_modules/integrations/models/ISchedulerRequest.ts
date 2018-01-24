import { IConnectorTaskDefinition } from './../../../domain/master/connectors/connector';

export interface ISchedulerRequest {
    identifier: string;
    secret: string;
    task: IConnectorTaskDefinition;
}