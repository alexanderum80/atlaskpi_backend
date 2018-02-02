import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { FindAllPermissionsQuery } from './queries/find-all-permissions.query';


@AppModule({
    queries: [
        FindAllPermissionsQuery
    ]
})
export class PermissionsModule extends ModuleBase { }