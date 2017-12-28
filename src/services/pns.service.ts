import { IPnsConfig } from '../configuration/config-models';
import * as Promise from 'bluebird';
import axios, { AxiosInstance } from 'axios';
import { inject, injectable } from 'inversify';
import { IUserDocument } from '../domaim/app/security/users/user';

export interface IPnsNotificatiopnPayload {

}

const iosAppId = 'com.kpibi.atlaskpi.mobile';
const androidAppId = 'com.kpibi.atlaskpi.mobile';

@injectable()
export class PnsService {
    private _client: AxiosInstance;

    constructor(@inject('Config') private _config: IAppConfig) {
        this._client = axios.create({
            baseURL: _config.pns.pnsServer,
            timeout: 1000,
            headers: {
                'Content-Type': 'application/json',
                clientId: _config.pns.appIdentifier
            }
          });
    }

    sendNotifications(users: IUserDocument[], message: string, extraInfo?: any): Promise<boolean> {
        if (!users || users.length < 1 || !message) {
            throw new Error('Push notifications need users and a meesage to send');
        }

        const that = this;

        return new Promise<boolean>((resolve, reject) => {

            const payload = _preparePayload(users, message, extraInfo);

            this._client.post('notify', payload).then(res => {
                resolve(true);
            })
            .catch(err => {
                resolve(false);
            });
        });
    }


}


interface IMessageTarget {
    appId: string;
    token: string;
}

interface IPnsMessagePayload {
    appTokens: IMessageTarget[];
    message: string;
    payload?: string;
}

function _preparePayload(users: IUserDocument[], message: string, extraInfo?: any): IPnsMessagePayload {
    const payload: IPnsMessagePayload = {
        message: message,
        appTokens: []
    };

    if (extraInfo) {
        payload.payload = extraInfo;
    }

    users.forEach(u => {
        if (!u.mobileDevices) {
            return;
        }

        u.mobileDevices.forEach(d => {
            const appId = d.network === 'Apple' ? iosAppId : androidAppId;

            payload.appTokens.push({
                appId: appId,
                token: d.token
            });
        });
    });

    return payload;
}