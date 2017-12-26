import { IConnector } from '../../../domain/master/connectors/connector';
export interface IExecutionFlowResult {
    success: boolean;
    connector?: IConnector;
    error?: string;
}