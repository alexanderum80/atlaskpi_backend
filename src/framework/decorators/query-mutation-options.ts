import { IActivity } from '../modules/security/activity';

export interface GraphQLQueryMutationDecoratorOptions {
    name?: string;
    activity: new (...args) => IActivity;
    parameters?: any[];
    output: any;
}