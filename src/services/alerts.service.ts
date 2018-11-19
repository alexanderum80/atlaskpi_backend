import { inject, injectable } from 'inversify';
import { IAlertDocument, IAlertInfo } from '../domain/app/alerts/alerts';
import { CurrentUser } from '../domain/app/current-user';
import { IAlert } from '../domain/app/alerts/alerts';
import { Alerts } from '../domain/app/alerts/alerts.model';
import { NotificationSourceEnum } from '../domain/master/notification/notification';
import { Templates } from '../domain/master/template/template.model';
import { IMutationResponse } from '../framework/mutations/mutation-response';

const frequencyAlertItems: { name: string, cron: string }[] = [
    { name: 'every day', cron: '0 0 19 * * *' },
    { name: 'every business day', cron: '0 0 19 * * 1,2,3,4,5' },
    { name: 'every end of week', cron: '0 0 19 * * 5' },
    { name: 'monthly on the 1st', cron: '0 0 8 1 1,2,3,4,5,6,7,8,9,10,11,12 *' },
    { name: 'yearly on Jan 1st', cron: '0 0 8 1 1 *' }
];

function getCron(frequency: string) {
    if (!frequency) return '';

    const item = frequencyAlertItems.find(f => f.name === frequency);
    return !item ? '' : item.cron;
}

function getFrequency(cron: string) {
    if (!cron) return '';

    const item = frequencyAlertItems.find(f => f.cron === cron);
    return !item ? '' : item.name;
}

@injectable()
export class AlertsService {

    constructor(
        @inject(Alerts.name)
        private alerts: Alerts,
        @inject(CurrentUser.name)
        private currentUser: CurrentUser,
        @inject(Templates.name)
        private templates: Templates,
    ) {}

    async getAlertsByIdentifier(id: string): Promise<IAlertDocument[]> {
        if (!id) return [];

        const jobs = await this.alerts.model.find({ 'data.identifier': id })
            .exec();

        const docs = jobs.map(j => {
            return {
                _id: j.id!.toString(),
                active: j.active,
                pushNotification: j.data.template.push !== null,
                emailNotified: j.data.template.email !== null,
                notifyUsers: j.data.targets.users.map(u => u.id),
                frequency: getFrequency(j.cronSchedule[0]),
                timezone: j.timezone,
                modelAlert: {
                    name: '',
                    id: j.data.identifier,
                },
                dayOfMonth: 0
            };
        });

        return docs as any;
    }

    async addAlert(info: IAlertInfo): Promise<IMutationResponse> {
        try {
            const scheduleJob = await this.buildAlert(info);
            await this.alerts.model.create(scheduleJob);

            return { success: true };
        } catch (e) {
            console.error('there was an error creating alert', e);
            return { success: false, errors: e };
        }
    }

    async updateAlert(id: string, info: IAlertInfo): Promise<IMutationResponse> {
        try {
            const job = await this.alerts.model.findById(id).exec();

            if (!job) return { success: false };

            const scheduleJob = await this.buildAlert(info);
            await this.alerts.model.update({ _id: id }, scheduleJob).exec();

            return { success: true };
        } catch (e) {
            return { success: false };
        }
    }

    async removeAlert(id: string): Promise<IMutationResponse> {
        try {
            await this.alerts.model.remove({ _id: id }).exec();
            return { success: true };
        } catch (e) {
            console.error('error removing job', e);
            return { success: false };
        }
    }

    async setActive(id: string, active: boolean): Promise<IMutationResponse> {
        try {
            await this.alerts.model.update(
                { _id: id },
                { $set: { active: active } }
            ).exec();
            return { success: true };
        } catch (e) {
            console.error('error setting active flag for alert', e);
            return { success: false };
        }
    }

    private async buildAlert(info: IAlertInfo): Promise<IAlert> {
        const widgetNames = ['widget-email-template', 'widget-push-template'];
        const templates = await this.templates.model.find({
            name: { $in: widgetNames }
        });

        const emailTemplate = templates.find(t => t.name === widgetNames[0]);
        const pushTemplate = templates.find(t => t.name === widgetNames[1]);
        const alert: IAlert = {
            active: true,
            timezone: this.currentUser.get().profile.timezone,
            type: NotificationSourceEnum.widgetNotification,
            cronSchedule: [getCron(info.frequency)],
            data: {
                identifier: info.modelAlert.id,
                template: {
                    email : info.emailNotified ? emailTemplate.id : null,
                    push: info.pushNotification ? pushTemplate.id : null,
                },
                targets: {
                    users: info.notifyUsers.map(id => (
                        {
                            id,
                            deliveryMethods: [ 'push', 'email' ]
                        }
                    ))
                }
            },
        };

        return alert;
    }

}