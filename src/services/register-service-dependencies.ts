import { BridgeContainer } from '../framework/di/bridge-container';
import { AccountsService } from './accounts.service';
import { AuthService } from './auth.service';
import { SeedService } from './seed.service';
import { TargetService } from './target.service';
import { WidgetsService } from './widgets.service';

export function registerServices(container: BridgeContainer) {
    container.registerSingleton(AccountsService);
    container.registerSingleton(AuthService);

    container.registerPerWebRequest(SeedService);
    container.registerPerWebRequest(TargetService);
    container.registerPerWebRequest(WidgetsService);
}