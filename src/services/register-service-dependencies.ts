import { WidgetsService } from './widgets.service';
import { TargetService } from './target.service';
import { SeedService } from './seed.service';
import { AuthService } from './auth.service';
import { AccountsService } from './accounts.service';
import { Container } from 'inversify';

export function registerServices(container: Container) {
    container.bind<AccountsService>('AccountsService').to(AccountsService).inSingletonScope();
    container.bind<AuthService>('AuthService').to(AuthService).inSingletonScope();

    container.bind<SeedService>('SeedService').to(SeedService).inRequestScope();
    container.bind<TargetService>('TargetService').to(TargetService).inRequestScope();
    container.bind<WidgetsService>('WidgetsService').to(WidgetsService).inRequestScope();
}