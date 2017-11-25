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
        const definition = appModule[MetadataFieldsMap.Definition];

        // process imports
        if (definition.imports) {
            const moduleInstances = definition.imports.map(m => new m(container));
        }
    }
}