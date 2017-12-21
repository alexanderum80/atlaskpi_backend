import { IUserDocument } from '../../models/app/users/index';
import { IPnsConfig } from '../../../configuration/index';
import * as Promise from 'bluebird';
import axios, { AxiosInstance } from 'axios';

export interface IPnsNotificatiopnPayload {

}

const iosAppId = 'com.kpibi.atlaskpi.mobile';
const androidAppId = 'com.kpibi.atlaskpi.mobile';

export class PnsService {
    private _client: AxiosInstance;

    constructor(private _pnsConfig: IPnsConfig) {
        this._client = axios.create({
            baseURL: _pnsConfig.pnsServer,
            timeout: 1000,
            headers: {
                'Content-Type': 'application/json',
                clientId: _pnsConfig.appIdentifier
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

/*
 Sampel Payload for the notification server

 {
  "appTokens": [
    {
      "appId": "com.kpibi.atlaskpi.mobile",
      "token": "CD4D2CFA2EB87F7E59BA3E1ED38066320BBB36E3E319F780C5CAB73759796943"
    }
  ],
  "message": "We are AtlasKPI"
}
*/

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