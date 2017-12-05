import { LocationsQuery } from './queries/locations.query';
import { UpdateLocationMutation } from './mutations/update-location.mutation';
import { DeleteLocationMutation } from './mutations/delete-location.mutation';
import { CreateLocationMutation } from './mutations/create-location.mutation';
import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    mutations: [
        CreateLocationMutation,
        DeleteLocationMutation,
        UpdateLocationMutation
    ],
    queries: [
        LocationsQuery
    ]
})
export class LocationsModule extends ModuleBase { }