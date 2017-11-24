// import { GraphQLTypesMap, field, type, input, mutation } from '../../../framework';
import * as Hbs from 'handlebars';

export const GraphQLTypesMap = {
    String: 'String',
    Int: 'Int',
};

export enum GraphqlMetaType {
    Input,
    Type,
    Query,
    Mutation
}

export function type(definition?: any) {
    return function(target) {
        // create input graphql definition
        const typeTemplateText = `type {{typeName}} {
            {{#each fields}}
            {{this}}
            {{/each}}
        }`;

        const fields = target.prototype.fields;
        const fieldNames = Object.keys(fields);
        const payload = {
            typeName: target.name,
            fields: fieldNames.map(f => `${f}: ${fields[f]}`)
        };
        const graphQlType = Hbs.compile(typeTemplateText)(payload);

        updateMetadata(target, null, 'gqlArtifact', { type: 'type', name: target.name });
        updateMetadata(target, null, 'definition', graphQlType);
    };
}

export function input(definition?: any) {
    return function(target) {
        updateMetadata(target, null, target.name, GraphqlMetaType.Input);
        // create input graphql definition
        const inputTemplateText = `input {{typeName}} {
            {{#each fields}}
            {{this}}
            {{/each}}
        }`;

        const fields = target.prototype.fields;
        const fieldNames = Object.keys(fields);
        const payload = {
            typeName: target.name,
            fields: fieldNames.map(f => `${f}: ${fields[f]}`)
        };
        const graphQlType = Hbs.compile(inputTemplateText)(payload);

        updateMetadata(target, null, 'gqlArtifact', { type: 'input', name: target.name });
        updateMetadata(target, null, 'definition', graphQlType);
    };
}

export function field(definition?: any) {
    return function(target, property) {
        updateMetadata(target, 'fields', property, definition.type.name || definition.type);
    };
}


export function mutation(definition: any) {
    return (target) => {

        const parameters = definition.parameters.map(p => `${p.name}: ${p.type.name}`);

        const inputTemplateText = `{{mutationName}}({{#each parameters}}{{this}}{{/each}}): {{output}}`;
        const payload = {
            mutationName: definition.name || target.name,
            parameters: definition.parameters.map(p => `${p.name}: ${p.type.name || p.type}${p.required ? '!' : ''}`),
            output: definition.output.name
        };
        const graphQlType = Hbs.compile(inputTemplateText)(payload);

        updateMetadata(target, null, 'gqlArtifact', { type: 'mutation', name: target.name });
        updateMetadata(target, null, 'definition', graphQlType);
    };
}

export function query(definition: any) {
    return (target) => {

        const parameters = definition.parameters.map(p => `${p.name}: ${p.type.name}`);

        const inputTemplateText = `{{mutationName}}({{#each parameters}}{{this}}{{/each}}): {{output}}`;
        const payload = {
            mutationName: definition.name || target.name,
            parameters: definition.parameters.map(p => `${p.name}: ${p.type.name || p.type}${p.required ? '!' : ''}`),
            output: definition.output.name
        };
        const graphQlType = Hbs.compile(inputTemplateText)(payload);

        updateMetadata(target, null, 'gqlArtifact', { type: 'mutation', name: target.name });
        updateMetadata(target, null, 'definition', graphQlType);
    };
}

function updateMetadata(target, containerName, field, value) {

    if (containerName) {
        let variable = {};
        if (!target.hasOwnProperty(containerName)) {
            Object.defineProperty(target, containerName, {
                configurable: false,
                get: () => variable,
                set: (value) => variable = value
            });
        }

        if (target[containerName][field]) {
            return;
        }

        target[containerName][field] = value;
    } else {
        let propertyValue;
        if (!target.hasOwnProperty(field)) {
            Object.defineProperty(target, field, {
                configurable: false,
                get: () => propertyValue,
                set: (value) => propertyValue = value
            });
        }

        if (target[field]) {
            return;
        }

        target[field] = value;
    }
}



@type()
export class Location {
    @field({ type: GraphQLTypesMap.String })
    id: string;

    @field({ type: GraphQLTypesMap.String })
    name: number;

    resolver(data): Location {
        return null;
    }
}


@type()
export class BusinessUnit {
    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.Int })
    serviceType: number;

    @field({ type: Location })
    location: Location;
}

@input()
export class CreateBusinessUnitInput extends BusinessUnit { }

@mutation({
    name: 'createBusinessUnit',
    parameters: [{ name: 'input', type: CreateBusinessUnitInput }],
    output: BusinessUnit
})
export class CreateBusinessUnitMutationA {
    execute() { }
}

@query({
    name: 'businessUnit',
    parameters: [{ name: 'id', type: 'String', required: true }],
    output: BusinessUnit
})
export class GetBusinessUnitQuery {
    execute() { }
}
















// export class CreateBusinessUnitMutation1 extends MutationBase < IMutationResponse > {
//     constructor(
//         public identity: IIdentity,
//         private _BusinessUnitModel: IBusinessUnitModel) {
//         super(identity);
//     }

//     run(data): Promise < IMutationResponse > {
//         const that = this;

//         return new Promise < IMutationResponse > ((resolve, reject) => {
//             that._BusinessUnitModel.createNew(data.name, data.serviceType).then(businessunit => {
//                 resolve({
//                     success: true,
//                     entity: businessunit
//                 });
//             }).catch(err => {
//                 resolve({
//                     success: false,
//                     errors: [{
//                         field: 'general',
//                         errors: ['There was an error creating the business unit']
//                     }]
//                 });
//             });
//         });
//     }
// }
