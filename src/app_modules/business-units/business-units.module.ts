import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { CreateBusinessUnitMutation } from './mutations/create-business-unit.mutation';
import { DeleteBusinessUnitMutation } from './mutations/delete-business-unit.mutation';
import { UpdateBusinessUnitMutation } from './mutations/update-business-unit.mutation';
import { BusinessUnitByIdQuery } from './queries/business-unit-by-id.query';
import { BusinessUnitsQuery } from './queries/business-units.query';


@AppModule({
    mutations: [
        CreateBusinessUnitMutation,
        DeleteBusinessUnitMutation,
        UpdateBusinessUnitMutation
    ],
    queries: [
        BusinessUnitByIdQuery,
        BusinessUnitsQuery
    ]
})
export class BusinessUnitModule extends ModuleBase { }