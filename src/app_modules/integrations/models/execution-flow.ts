import { IExecutionFlowResult } from './execution-flow';
import { IConnector } from '../../../domain/master/connectors/connector';
export interface IExecutionFlowResult {
    success: boolean;
    connector?: IConnector;
    error?: string;
}

export function errorExecutionFlow(msg: any): IExecutionFlowResult {
    return {
        success: false,
        error: msg || 'unknown error'
    };
}