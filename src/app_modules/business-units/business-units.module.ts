import {
    AppModule, ModuleBase
} from '../../framework';
import {
    CreateBusinessUnitMutation,
    DeleteBusinessUnitMutation,
    UpdateBusinessUnitMutation
} from './mutations';
import {
    BusinessUnitByIdQuery,
    BusinessUnitsQuery
} from './queries';

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