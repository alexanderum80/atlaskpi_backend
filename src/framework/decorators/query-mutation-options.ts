import { IActivity } from '../authorization';

export interface GraphQLQueryMutationDecoratorOptions {
    name?: string;
    activity: IActivity;
    parameters: any[];
    output: any;
}