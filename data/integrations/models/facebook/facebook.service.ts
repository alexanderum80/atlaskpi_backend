import * as moment from 'moment';

import { ISocialNetwork, ISocialNetworkModel } from './../../../models/app/social-network/ISocialNetwork';
import { IConnectorDocument } from './../../../models/master/connectors/IConnector';
import { IConnectionResponse } from './facebook-connection-handler';

interface IFacebookMetrics {
    'fan_count': number;
    'rating_count': number;
    'talking_about_count': number;
    'were_here_count': number;
    'checkins': number;
}

export class FacebookService {
    constructor(private _socialNetworkModel: ISocialNetworkModel,
                private _connResponse: IConnectionResponse,
                private _connector: IConnectorDocument) {}

    public run(): Promise < any > {
        const that = this;
        return new Promise < any > ((resolve, reject) => {

            that._getMetrics(that._connResponse, that._connector)
            .then(res => {
                const metrics: IFacebookMetrics = {
                    fan_count: res.fan_count,
                    checkins: res.checkins,
                    rating_count: res.rating_count,
                    talking_about_count: res.talking_about_count,
                    were_here_count: res.were_here_count
                };

                const entry: ISocialNetwork = {
                    refId: that._connector.id.toString(),
                    name: that._connector.name,
                    date: new Date(moment().utc().format('YYYY-MM-DD')),
                    source: 'facebook',
                    metrics: metrics
                };

                const query = { date: entry.date, name: entry.name, source: entry.source };
                const options = { upsert: true, new: true };

                that._socialNetworkModel.findOneAndUpdate(query, entry, options)
                .then(doc => {
                    console.log('metrics upserted for date: ' + entry.date.toUTCString());
                    resolve();
                    return;
                })
                .catch(err => {
                    console.log('an error occured upserting metrics: ' + err);
                    reject(err);
                    return;
                });
            })
            .catch(err => {
                console.log('an error occured getting metrics: ' + err);
                reject(err);
                return;
            });
        });
    }

    private _getMetrics(connResponse: IConnectionResponse, connector: IConnectorDocument): Promise<IFacebookMetrics> {
        if (!connResponse || !connResponse.connection) {
            return Promise.reject('cannot run the service without a connection');
        }

        const that = this;
        return new Promise<any>((resolve, reject) => {
            connResponse.connection.setAccessToken(connResponse.page.access_token);
            connResponse.connection.api(connResponse.page.id,
                                        { fields: [ 'fan_count', 'rating_count',
                                                    'talking_about_count', 'were_here_count',
                                                    'checkins']
                                        }, (res) => {
                if (!res || res.error) {
                    console.log(!res ? 'error occurred' : res.error);
                    reject(res.error);
                    return;
                }

                resolve(res);
                return;
            });
        });
    }
}