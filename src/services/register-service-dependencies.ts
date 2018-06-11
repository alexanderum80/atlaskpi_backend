import { IBridgeContainer } from '../framework/di/bridge-container';
import { AccountsService } from './accounts.service';
import { UserAttachmentsService } from './attachments/user-attachments.service';
import { AuthService } from './auth.service';
import { CallRailService } from './callrail.services';
import { ChartsService } from './charts.service';
import { ConnectorsService } from './connectors.service';
import { DataSourcesService } from './data-sources.service';
import { ExternalDataSourcesService } from './external-data-sources.service';
import { KpiService } from './kpi.service';
import { GoogleAnalyticsKPIService } from './kpis/google-analytics-kpi/google-analytics-kpi.service';
import { MilestoneService } from './milestone.services';
import { AccountCreatedNotification } from './notifications/users/account-created.notification';
import { EnrollmentNotification } from './notifications/users/enrollment.notification';
import { LeadReceivedNotification } from './notifications/users/lead-received.notification';
import { TargetNotification } from './notifications/users/target.notification';
import { UserForgotPasswordNotification } from './notifications/users/user-forgot-password.notification';
import { UserMilestoneNotification } from './notifications/users/user-milestone.notification';
import { PnsService } from './pns.service';
import { GAJobsQueueService } from './queues/ga-jobs-queue.service';
import { SeedService } from './seed/seed.service';
import { SocialWidgetsService } from './social-widgets.service';
import { TargetService } from './target.service';
import { UserPasswordService } from './user-password.service';
import { UserService } from './user.service';
import { WidgetsService } from './widgets.service';

export function registerServices(container: IBridgeContainer) {
    container.registerSingleton(PnsService);
    container.registerSingleton(GAJobsQueueService);

    // notifications
    container.registerSingleton(TargetNotification);
    container.registerSingleton(LeadReceivedNotification);

    container.registerPerWebRequest(UserMilestoneNotification);
    container.registerPerWebRequest(AccountCreatedNotification);
    container.registerPerWebRequest(UserForgotPasswordNotification);
    container.registerPerWebRequest(EnrollmentNotification);
    container.registerPerWebRequest(DataSourcesService);
    container.registerPerWebRequest(UserAttachmentsService);
    container.registerPerWebRequest(AccountsService);
    container.registerPerWebRequest(AuthService);
    container.registerPerWebRequest(CallRailService);
    container.registerPerWebRequest(SeedService);
    container.registerPerWebRequest(TargetService);
    container.registerPerWebRequest(WidgetsService);
    container.registerPerWebRequest(ChartsService);
    container.registerPerWebRequest(KpiService);
    container.registerPerWebRequest(UserService);
    container.registerPerWebRequest(MilestoneService);
    container.registerPerWebRequest(SocialWidgetsService);
    container.registerPerWebRequest(ConnectorsService);
    container.registerPerWebRequest(GoogleAnalyticsKPIService);
    container.registerPerWebRequest(ExternalDataSourcesService);
    container.registerPerWebRequest(UserPasswordService);
}