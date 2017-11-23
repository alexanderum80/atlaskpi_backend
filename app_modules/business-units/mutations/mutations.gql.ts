// import { GraphQLTypesMap, field, type, input, mutation } from '../../../framework';

export const GraphQLTypesMap = {
    String: 'String',
    Int: 'Integer',
};

export enum GraphqlMetaType {
    Input,
    Type,
    Query,
    Mutation
}

export function type(definition?: any) {
    return function(target) {
        updateMetadata(target, null, target.name, GraphqlMetaType.Type);
    };
}

export function field(definition?: any) {
    return function(target, property) {
        updateMetadata(target, 'fields', property, definition.type);
    };
}

export function input(definition?: any) {
    return function(target) {
        updateMetadata(target, null, target.name, GraphqlMetaType.Input);
        return null;
    };
}


export function mutation(definition: any) {
    return (target) => {
        console.log(definition.name);
        console.log(JSON.stringify(definition.input.constructor()));
    };
}

function updateMetadata(target, containerName, field, value) {
    if (!target.___metadata___) {
        target.___metadata___ = {};
    }

    let container: any;

    if (containerName) {
        if (!target.___metadata___[containerName]) {
            target.___metadata___[containerName] = {};
        }

        container = target.___metadata___[containerName];
    } else {
        container = target.___metadata___;
    }

    if (container[field]) {
        throw new Error('A property with the same name was already defined on: ' + target.constructor.name);
    }

    container[field] = value;
}


@type()
export class BusinessUnitType {
    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.Int })
    serviceType: number;
}

@input()
export class CreateBusinessUnitInput extends BusinessUnitType { }

@mutation({
    name: 'createBusinessUnit',
    input: CreateBusinessUnitInput,
    output: BusinessUnitType
})
export class CreateBusinessUnitMutationA {
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
