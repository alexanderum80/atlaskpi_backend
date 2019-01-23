import axios, { AxiosInstance } from 'axios';
import { injectable } from 'inversify';

import { config } from '../../configuration/config';
import { IMobileDevice } from '../../domain/app/security/users/user';

export interface IMessageTarget {
    appId: string;
    token: string;
}

export interface IPnsMessagePayload {
    appTokens: IMessageTarget[];
    message: string;
    payload?: string;
}

const IOS_APP_ID = 'com.kpibi.atlaskpi.mobile';
const ANDROID_APP_ID = 'com.kpibi.atlaskpi.mobile';

@injectable()
export class PushNotifier {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: config.pns.pnsServer,
            timeout: 1000,
            headers: {
                'Content-Type': 'application/json',
                clientId: config.pns.appIdentifier,
            },
        });
    }

    async notify(targets: IMobileDevice[], message: string): Promise<any> {
        try {
            const payload: IPnsMessagePayload = {
                message,
                appTokens: targets.map(d => ({
                    appId: d.network === 'Apple' ? IOS_APP_ID : ANDROID_APP_ID,
                    token: d.token,
                })),
            };

            return await this.client.post('notify', payload);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

}