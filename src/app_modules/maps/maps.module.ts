import { ListMapsQuery } from './queries/list-maps.query';
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { MapMarkersQuery } from './queries/map-markers.query';
import { DeleteMapMutation } from './mutations/delete-map.mutation';
import { CreateMapMutation } from './mutations/create-map.mutation';
import { UpdateMapMutation } from './mutations/update-map.mutation';
import { GetMapByTitleQuery } from './queries/get-map-by-title.query';
import { MapQuery } from './queries/map.query';

@AppModule({
    mutations: [
        CreateMapMutation,
        DeleteMapMutation,
        UpdateMapMutation
    ],
    queries: [
        MapMarkersQuery,
        GetMapByTitleQuery,
        ListMapsQuery,
        MapQuery
    ]
})
export class MapsModule extends ModuleBase { }
