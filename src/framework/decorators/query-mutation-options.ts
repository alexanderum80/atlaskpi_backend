import { IActivity } from '../modules/security/activity';

export interface IParameterDefinition {
    name: string;
    type: any;
    required?: boolean;
}

export interface GraphQLQueryMutationDecoratorOptions {
    name?: string;
    activity: new (...args) => IActivity;
    parameters?: IParameterDefinition[];
    output: any;
}
