import { IBridgeContainer } from '../framework/di/bridge-container';
import { AccountsService } from './accounts.service';
import { AuthService } from './auth.service';
import { SeedService } from './seed.service';
import { TargetService } from './target.service';
import { WidgetsService } from './widgets.service';
import { ChartsService } from './charts.service';

export function registerServices(container: IBridgeContainer) {
    container.registerSingleton(AccountsService);
    container.registerSingleton(AuthService);

    container.registerPerWebRequest(SeedService);
    container.registerPerWebRequest(TargetService);
    container.registerPerWebRequest(WidgetsService);
    container.registerPerWebRequest(ChartsService);
}