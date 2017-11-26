import { getGraphqlExecutableSchema } from './graphql/graphql-schema-generator';
import { IAppModule } from './decorators/app-module';
import {
    IModuleOptions
} from './decorators';
import {
    IQuery
} from './queries';
import {
    IMutation
} from './mutations';
import {
    GraphqlDefinition,
    GraphqlSchema
} from './graphql';
import {
    MetadataFieldsMap
} from './decorators';
import {
    Container
} from 'inversify';

interface IQueryData {
    types: string[];
    queries: string[];
    instances: IQuery < any > ;
}


export class Framework {

    static bootstrap(appModule: new() => IAppModule, container: Container) {
        const moduleDefinition = appModule[MetadataFieldsMap.Definition];
        let moduleInstances: IAppModule[];

        // process module imports
        if (moduleDefinition.imports) {
            moduleInstances = moduleDefinition.imports.map(m => new m(container));
        }

        // create app module
        const app = new appModule();

        if (!moduleInstances) {
            moduleInstances = [];
        }

        moduleInstances.push(app);

        // generate graphql schema
        const graphqlSchema = getGraphqlExecutableSchema(moduleInstances);
    }
}