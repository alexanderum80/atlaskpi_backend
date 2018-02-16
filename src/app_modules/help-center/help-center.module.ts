import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { HelpCenterUserByIdQuery } from './queries/help-center-user-by-id.query';


@AppModule({
    mutations: [
    ],
    queries: [
        HelpCenterUserByIdQuery
    ]
})
export class HelpCenterUsersModule extends ModuleBase { }