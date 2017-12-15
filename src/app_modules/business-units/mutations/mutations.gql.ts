import { type } from '../../../framework/decorators/type.decorator';
import * as Promise from 'bluebird';
import { inject } from 'inversify';
import { injectable } from 'inversify';

import { IAppConfig } from '../../../configuration/config-models';
import { AppModule, ModuleBase } from '../../../framework/decorators/app-module';
import { field } from '../../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { input } from '../../../framework/decorators/input.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { query } from '../../../framework/decorators/query.decorator';
import { resolver } from '../../../framework/decorators/resolver.decorator';
import { IActivity } from '../../../framework/modules/security/activity';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IQuery } from '../../../framework/queries/query';

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

    @resolver({ forField: 'location' })
    static resolveLocation(data: Location) {
        // resolve your type here
    }
}

@input()
export class CreateBusinessUnitInput {
    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.Int })
    serviceType: number;
}

const CreateBusinessUnitActivity: IActivity = {} as IActivity;

@injectable()
@mutation({
    name: 'createBusinessUnit',
    activity: CreateBusinessUnitActivity,
    parameters: [{ name: 'input', type: CreateBusinessUnitInput }],
    output: BusinessUnit
})
export class CreateBusinessUnitMutation extends MutationBase<BusinessUnit> {

    constructor(@inject('Config') private _config: IAppConfig) {
        super();
    }

    run(data: any): Promise<BusinessUnit> {
        return null;
    }

}

const GetBusinessUnitQueryActivity: IActivity = {} as IActivity;

@injectable()
@query({
    name: 'businessUnit',
    activity: GetBusinessUnitQueryActivity,
    parameters: [{ name: 'id', type: 'String', required: true }],
    output: BusinessUnit
})
export class GetBusinessUnitQuery implements IQuery<BusinessUnit> {

    run(data: any): Promise<any> {
        return Promise.resolve('value');
    }

}

@AppModule({
    queries: [GetBusinessUnitQuery],
    mutations: [CreateBusinessUnitMutation]
})
export class BusinessUnitModule extends ModuleBase {

    // registerDependencies(container: Container) {
    //     container.bind<GetBusinessUnitQuery>('GetBusinessUnitQuery').to(GetBusinessUnitQuery);
    //     container.bind<CreateBusinessUnitMutation>('CreateBusinessUnitMutation').to(CreateBusinessUnitMutation);
    // }
}


@AppModule({
    imports: [BusinessUnitModule]
})
export class AtlasApp extends ModuleBase { }










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
