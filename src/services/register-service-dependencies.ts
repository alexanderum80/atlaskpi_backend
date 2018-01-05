import { CallRailService } from './callrail.services';
import { PnsService } from './pns.service';
import { EnrollmentNotification } from './notifications/users/enrollment.notification';
import { UserForgotPasswordNotification } from './notifications/users/user-forgot-password.notification';
import { AccountCreatedNotification } from './notifications/users/account-created.notification';
import { TargetNotification } from './notifications/users/target.notification';
import { IBridgeContainer } from '../framework/di/bridge-container';
import { AccountsService } from './accounts.service';
import { AuthService } from './auth.service';
import { ChartsService } from './charts.service';
import { ConnectorsService } from './connectors.service';
import { SeedService } from './seed.service';
import { SocialWidgetsService } from './social-widgets.service';
import { TargetService } from './target.service';
import { WidgetsService } from './widgets.service';

export function registerServices(container: IBridgeContainer) {
    container.registerSingleton(AccountsService);
    container.registerSingleton(AuthService);
    container.registerSingleton(PnsService);

    // notifications
    container.registerSingleton(TargetNotification);
    container.registerSingleton(AccountCreatedNotification);
    container.registerSingleton(UserForgotPasswordNotification);
    container.registerSingleton(EnrollmentNotification);

    // integration callrail service
    container.registerPerWebRequest(CallRailService);

    container.registerPerWebRequest(SeedService);
    container.registerPerWebRequest(TargetService);
    container.registerPerWebRequest(WidgetsService);
    container.registerPerWebRequest(ChartsService);
    container.registerPerWebRequest(SocialWidgetsService);
    container.registerPerWebRequest(ConnectorsService);
}