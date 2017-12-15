import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { CreateLocationMutation } from './mutations/create-location.mutation';
import { DeleteLocationMutation } from './mutations/delete-location.mutation';
import { UpdateLocationMutation } from './mutations/update-location.mutation';
import { LocationsQuery } from './queries/locations.query';

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