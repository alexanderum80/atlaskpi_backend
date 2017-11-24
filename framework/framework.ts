import { IModuleOptions } from './decorators';
import { IQuery } from './queries';
import { IMutation } from './mutations';
import { GraphqlDefinition, GraphqlSchema } from './graphql';

interface IQueryData {
    types: string[];
    queries: string[];
    instances: IQuery<any>;
}


function _getQueries(queries: Array<new () => IQuery<any>>) {
    if (!queries) {
        return null;
    }
}

function _generateGraphqlSchema(name: string, options: IModuleOptions): string {
    const result: GraphqlDefinition = {
        name: name,
        schema: {} as any,
        resolvers: {}
    };

    return null;


}

export class Framework {

    static bootstrap(module: IModuleOptions) {
        // const queries = _getQueries(options.queries);
        // const graphqlSchema = _generateGraphqlSchema(target.name, options);
    }

}