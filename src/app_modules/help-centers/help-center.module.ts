import { HelpCenterQuery } from './queries/help-center.query';
import { AppModule, ModuleBase } from '../../framework/decorators/app-module';

@AppModule({
    queries: [
        HelpCenterQuery
    ],
    mutations: []
})

export class HelpCenterModule extends ModuleBase {}
