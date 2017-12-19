import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { MapMarkersQuery } from './queries/map-markers.query';

@AppModule({
    queries: [
        MapMarkersQuery
    ]
})
export class MapsModule extends ModuleBase { }
