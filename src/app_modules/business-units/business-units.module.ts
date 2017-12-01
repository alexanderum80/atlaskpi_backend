import {
    IModule,
    AppModule
} from '../../framework';
import {
    businessUnitsGql
} from './business-units.gql';
import {
    businessUnitByIdActivity,
    createBusinessUnitActivity,
    deleteBusinessUnitActivity,
    listBusinessUnitsActivity,
    updateBusinessUnitActivity,
} from './activities';
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
    declarations: [
        // graphql
        businessUnitsGql,
        // activities
        businessUnitByIdActivity,
        createBusinessUnitActivity,
        deleteBusinessUnitActivity,
        listBusinessUnitsActivity,
        updateBusinessUnitActivity,
        // mutations
        CreateBusinessUnitMutation,
        DeleteBusinessUnitMutation,
        UpdateBusinessUnitMutation,
        // queries
        BusinessUnitByIdQuery,
        BusinessUnitsQuery
    ],
    exports: [
        businessUnitsGql
    ]
})
export class BusinessUnitsModule {}