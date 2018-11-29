import { inject, injectable } from 'inversify';
import { IAlertDocument, IAlertInfo } from '../domain/app/alerts/alerts';
import { CurrentUser } from '../domain/app/current-user';
import { IAlert } from '../domain/app/alerts/alerts';
import { Alerts } from '../domain/app/alerts/alerts.model';
import { NotificationSourceEnum } from '../domain/master/notification/notification';
import { Templates } from '../domain/master/template/template.model';
import { IMutationResponse } from '../framework/mutations/mutation-response';
import { AlertInput } from '../app_modules/alerts/alerts.types';

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
        @inject(Alerts.name) private alerts: Alerts) {}

    async getAlerts(): Promise<IAlertDocument[]> {
        try {
            const alerts = await this.alerts.model.find({}).exec();
            return alerts;
        } catch (e) {
            console.error('there was an error getting alerts', e);
            return null;
        }
    }

    async addAlert(info: AlertInput): Promise<IMutationResponse> {
        try {
            await this.alerts.model.createAlert(info);

            return { success: true };
        } catch (e) {
            console.error('there was an error creating alert', e);
            return { success: false, errors: e };
        }
    }

    async updateAlert(id: string, info: AlertInput): Promise<IMutationResponse> {
        try {
            const alert = await this.alerts.model.findById(id).exec();

            if (!alert) return { success: false };

            const result = await this.alerts.model.updateAlert(id, info);

            return { success: true };
        } catch (e) {
            return { success: false };
        }
    }

    async removeAlert(id: string): Promise<IMutationResponse> {
        try {
            await this.alerts.model.remove({ _id: id }).exec();
            return {
                success: true,
                entity: null,
                errors: [
                    {
                        field: '',
                        errors: ['']
                    }]
                };
        } catch (e) {
            console.error('error removing alert', e);
            return {
                success: false,
                entity: null,
                errors: [
                    {
                        field: '',
                        errors: [e]
                    }]
                };
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

}