import { MilestoneService } from './milestone.services';
import { UserMilestoneNotification } from './notifications/users/user-milestone.notification';
import { IBridgeContainer } from '../framework/di/bridge-container';
import { AccountsService } from './accounts.service';
import { AuthService } from './auth.service';
import { CallRailService } from './callrail.services';
import { ChartsService } from './charts.service';
import { ConnectorsService } from './connectors.service';
import { ExternalDataSourcesService } from './external-data-sources.service';
import { KpiService } from './kpi.service';
import { GoogleAnalyticsKPIService } from './kpis/google-analytics-kpi/google-analytics-kpi.service';
import { AccountCreatedNotification } from './notifications/users/account-created.notification';
import { EnrollmentNotification } from './notifications/users/enrollment.notification';
import { TargetNotification } from './notifications/users/target.notification';
import { UserForgotPasswordNotification } from './notifications/users/user-forgot-password.notification';
import { PnsService } from './pns.service';
import { SeedService } from './seed/seed.service';
import { SocialWidgetsService } from './social-widgets.service';
import { TargetService } from './target.service';
import { WidgetsService } from './widgets.service';

export function registerServices(container: IBridgeContainer) {
    container.registerSingleton(AccountsService);
    container.registerSingleton(AuthService);
    container.registerSingleton(PnsService);

    // notifications
    container.registerSingleton(TargetNotification);
    container.registerSingleton(UserMilestoneNotification);
    container.registerSingleton(AccountCreatedNotification);
    container.registerSingleton(UserForgotPasswordNotification);
    container.registerSingleton(EnrollmentNotification);

    // integration callrail service
    container.registerPerWebRequest(CallRailService);

    container.registerPerWebRequest(SeedService);
    container.registerPerWebRequest(TargetService);
    container.registerPerWebRequest(WidgetsService);
    container.registerPerWebRequest(ChartsService);
    container.registerPerWebRequest(KpiService);
    container.registerPerWebRequest(MilestoneService);
    container.registerPerWebRequest(SocialWidgetsService);
    container.registerPerWebRequest(ConnectorsService);
    container.registerPerWebRequest(GoogleAnalyticsKPIService);
    container.registerPerWebRequest(ExternalDataSourcesService);
}