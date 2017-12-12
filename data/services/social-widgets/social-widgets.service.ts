import * as Promise from 'bluebird';
import * as moment from 'moment';

import { IAppModels } from '../../models/app/app-models';
import { parsePredifinedDate } from '../../models/common';
import { IIdentity } from './../../models/app/identity';
import { ISocialNetworkDocument } from './../../models/app/social-network/ISocialNetwork';
import { ISocialWidget } from './../../models/app/social-widgets/social-widget-base';
import { IConnectorDocument } from './../../models/master/connectors/IConnector';
import { IMasterModels } from './../../models/master/master-models';
import { SocialWidgetFactory } from './social-widget.factory';

export class SocialWidgetsService {

    constructor(private _identity: IIdentity,
                private _appContext: IAppModels,
                private _masterContext: IMasterModels) { }

    getSocialWidgets(startDate: string, textDate: string): Promise<ISocialWidget[]> {
        const date = startDate ? moment(startDate).toDate() : moment().utc().toDate();
        const that = this;
        return new Promise<ISocialWidget[]>((resolve, reject) => {
            that._masterContext.Connector.find({
                databaseName: that._identity.accountName,
                type: { $in: [ 'twitter', 'linkedin', 'facebook', 'instagram' ] }
            })
            .then(connectors => {
                if (!connectors || !connectors.length) {
                    resolve([]);
                    return;
                }

                Promise.map(connectors, c => that._toSocialWidget(c, date, textDate)).then(widgets => {
                    resolve(widgets);
                    return;
                })
                .catch(err => {
                    reject(err);
                    return;
                });
            })
            .catch(err => {
                reject(err);
                return;
            });
        });
        // return Promise.resolve([]);
    }

    private _toSocialWidget(doc: IConnectorDocument, date: Date, textDate: string): Promise<ISocialWidget> {
        const that = this;
        return new Promise<ISocialWidget>((resolve, reject) => {
            const socialWidget = SocialWidgetFactory.getInstance(doc);

            if (!socialWidget) {
                reject('connector unknown');
                return;
            }

            that._getDateMetrics(date, doc._id).then(metricDoc => {
                socialWidget.setValue(metricDoc);

                that._getHistoricalMetric(doc._id, textDate).then(historicMetrics => {
                    if (historicMetrics) {
                        socialWidget.setHistoricalValue(historicMetrics, textDate);
                    }
                    resolve(socialWidget.toSocialWidgetObject());
                    return;
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));

        });
    }

    private _getDateMetrics(date: Date, connectorId: string): Promise<ISocialNetworkDocument> {
        const that = this;
        const startOfDay = moment(date).utc().startOf('day');
        const endOfDay = moment(date).utc().endOf('day');
        return new Promise<ISocialNetworkDocument>((resolve, reject)  => {
            return that ._appContext
                        .SocialNetwork
                        .findOne({  refId: connectorId,
                                    date: { '$gte': startOfDay, '$lte': endOfDay }
                        })
                        .sort({ date: -1 })
                        .limit(1)
                        .exec()
                        .then(doc => {
                            console.log('latest: ' + JSON.stringify(doc));
                            resolve(doc);
                            return;
                        })
                        .catch(err => {
                            reject(err);
                            return;
                        });
        });
    }

    private _getHistoricalMetric(connectorId: string, textDate: string): Promise<ISocialNetworkDocument> {
        const that = this;
        const parsedDate = parsePredifinedDate(textDate);
        const startOfDay = moment(parsedDate.from).utc().startOf('day');
        const endOfDay = moment(parsedDate.from).utc().endOf('day');

        return new Promise<ISocialNetworkDocument>((resolve, reject) => {
            return that ._appContext
                        .SocialNetwork
                        .findOne({  refId: connectorId,
                                    date: { '$gte': startOfDay, '$lte': endOfDay }
                        })
                        .sort({ date: -1 })
                        .limit(1)
                        .exec()
                        .then(doc => {
                            console.log('historical: ' + JSON.stringify(doc));
                            resolve(doc);
                            return;
                        })
                        .catch(err => {
                            reject(err);
                            return;
                        });
        });
    }
}