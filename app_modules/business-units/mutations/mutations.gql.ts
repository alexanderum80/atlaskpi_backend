import * as Promise from 'bluebird';
import { type, field, input, mutation, query, GraphQLTypesMap, IActivity, Module, IQuery, QueryBase, MutationBase } from './../../../framework';

@type()
export class Location {
    @field({ type: GraphQLTypesMap.String, required: true })
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

const CreateBusinessUnitActivity: IActivity = {} as IActivity;

@mutation({
    name: 'createBusinessUnit',
    activity: CreateBusinessUnitActivity,
    parameters: [{ name: 'input', type: CreateBusinessUnitInput }],
    output: BusinessUnit
})
export class CreateBusinessUnitMutation extends MutationBase<BusinessUnit> {

    run(data: any): Promise<BusinessUnit> {
        return null;
    }

}

const GetBusinessUnitQueryActivity: IActivity = {} as IActivity;

@query({
    name: 'businessUnit',
    activity: GetBusinessUnitQueryActivity,
    parameters: [{ name: 'id', type: 'String', required: true }],
    output: BusinessUnit
})
export class GetBusinessUnitQuery extends QueryBase<BusinessUnit> {

    run(data: any): Promise<any> {
        return Promise.resolve('value');
    }

}

@Module({
    queries: [GetBusinessUnitQuery],
    mutations: [CreateBusinessUnitMutation]
})
export class BusinessUnitModule { }


@Module({
    imports: [BusinessUnitModule]
})
export class AtlasApp { }










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
