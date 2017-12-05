import { IActivity } from '../modules/security';

export interface GraphQLQueryMutationDecoratorOptions {
    name?: string;
    activity: new (...args) => IActivity;
    parameters?: any[];
    output: any;
}