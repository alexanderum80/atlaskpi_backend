import { FindAllPermissionsQuery } from './queries';
import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    queries: [
        FindAllPermissionsQuery
    ]
})
export class PermissionsModule extends ModuleBase { }