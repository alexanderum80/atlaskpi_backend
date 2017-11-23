import { IMutation, GraphqlDefinition, IQuery } from './common';
import { IActivity } from '../lib/enforcer/index';

export interface IModule {
    declarations: [IActivity | GraphqlDefinition | IMutation<any> | IQuery<any>];
    exports?: [GraphqlDefinition | IMutation<any> | IQuery<any>];
    // graphqlDefinition: GraphqlDefinition;
}