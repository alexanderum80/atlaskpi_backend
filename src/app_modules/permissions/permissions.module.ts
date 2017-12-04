import { GetPermissionsQuery } from './queries/get-permissions.query';
import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    queries: [
        GetPermissionsQuery
    ]
})
export class PermissionsModule extends ModuleBase { }