import { GraphqlDefinition, GraphqlSchema } from '../graphql';
import { updateMetadata } from './helpers';
import { IQuery } from '../queries/query';
import { IMutation } from '../mutations/mutation';
import { MetadataFieldsMap } from './metadata-fields.map';
import * as _ from 'lodash';

export interface IModuleOptions {
    imports?: IModuleOptions[];
    queries?: Array<new () => IQuery<any>>;
    mutations?: Array<new () => IMutation<any>>;
}

export function Module(options: IModuleOptions) {
    return function (target) {
        // save a reference to the original constructor
        const original = target;

        // a utility function to generate instances of a class
        function construct(constructor, args) {
            const c: any = function () {
                if (options.mutations) {
                    this[MetadataFieldsMap.MutationInstances] = options.mutations.map(m => new m());
                }

                if (options.queries) {
                    this[MetadataFieldsMap.QueryInstances] = options.queries.map(q => new q());
                }

                if (options.mutations || options.queries) {
                    this[MetadataFieldsMap.Squema] = _constructGraphQLSchema.apply(this, [target.name, options]);
                }


                return constructor.apply(this, args);
            };

            c.prototype = constructor.prototype;
            return new c();
        }

        // the new constructor behaviour
        const f: any = function (...args) {
            return construct(original, args);
        };

        // copy prototype so intanceof operator still works
        f.prototype = original.prototype;

        updateMetadata(f, null, MetadataFieldsMap.Definition, options);

        // return new constructor (will override original)
        return f;
    };
}


function _constructGraphQLSchema(name: string, options: IModuleOptions) {
    const result: GraphqlDefinition = {
        name: name,
        schema: {} as GraphqlSchema,
        resolvers: {}
    };

    let artifacts = [];

    if (options.queries) {
        artifacts = artifacts.concat(_processQueriesMutations(options.queries));
        artifacts = artifacts.concat(_processQueriesMutations(options.mutations));
    }

    // dedup
    artifacts = dedup(artifacts, ['type', 'name']);

    return result;
}

function _processQueriesMutations(list) {
    let result = [];

    list.forEach(q => {
        // save queries
        result.push({
            type: q[MetadataFieldsMap.Artifact].type,
            name: q[MetadataFieldsMap.Artifact].name,
            definition: q[MetadataFieldsMap.Definition]
        });

        // save types
        const types = q[MetadataFieldsMap.Types];
        if (types) {
            types.forEach(t => {
                result.push({
                    type: t[MetadataFieldsMap.Artifact].type,
                    name: t[MetadataFieldsMap.Artifact].name,
                    definition: t[MetadataFieldsMap.Definition]
                });
            });
        }
    });

    return result;
}

function dedup(list: any[], keyFields: string[]) {
    const obj = {};

    for (let i = 0, len = list.length; i < len; i++ ) {
        const key = keyFields.map(k => list[i][k].toString()).join('____');
        obj[key] = list[i];
    }

    const result = [];
    for (const key in obj )
        result.push(obj[key]);

    return result;
}