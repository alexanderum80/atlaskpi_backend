import { readTemplate } from '../configuration-utils';

export interface IAppServicesConfig {
    services: {
        notifySupport: {
            emailTemplate: string;
        }
    };
}

export const appServicesConfig = {
    services: {
        notifySupport: {
            emailTemplate: readTemplate('app', 'notify-support')
        }
    }
};
