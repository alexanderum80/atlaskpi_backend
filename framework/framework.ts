import { IModuleOptions } from './decorators';
import { IQuery } from './queries';
import { IMutation } from './mutations';
import { GraphqlDefinition, GraphqlSchema } from './graphql';
import { MetadataFieldsMap } from './decorators';

interface IQueryData {
    types: string[];
    queries: string[];
    instances: IQuery<any>;
}


export class Framework {

    static bootstrap(appModule: new () => IModuleOptions) {
        const definition = appModule[MetadataFieldsMap.Definition];

        // process imports
        if (definition.imports) {
            const moduleInstances = definition.imports.map(m => new m());
    }
}
