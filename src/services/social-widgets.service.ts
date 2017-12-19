import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

import { parsePredifinedDate } from '../domain/common/date-range';
import { CurrentAccount } from '../domain/master/current-account';
import { ISocialNetworkDocument } from './../domain/app/social-networks/social-network';
import { SocialNetwork } from './../domain/app/social-networks/social-network.model';
import { ISocialWidget } from './../domain/app/social-widget/social-widget-base';
import { SocialWidgetFactory } from './../domain/app/social-widget/social-widget.factory';
import { IConnectorDocument } from './../domain/master/connectors/connector';
import { Connectors } from './../domain/master/connectors/connector.model';

@injectable()
export class SocialWidgetsService {

    constructor(
        @inject(SocialNetwork.name) private _socialNetworks: SocialNetwork,
        @inject(Connectors.name) private _connectors: Connectors,
        @inject(CurrentAccount.name) private _currentAccount: CurrentAccount
    ) { }

    getSocialWidgets(startDate: string, textDate: string): Promise<ISocialWidget[]> {
        const date = startDate ? moment(startDate).toDate() : moment().utc().toDate();
        const that = this;
        return new Promise<ISocialWidget[]>((resolve, reject) => {
            that._connectors.model.find({
                databaseName: that._currentAccount.get.database.name,
                // this need to be changed... its only for retrieving implemented social networks
                type: { $in: [ 'twitter', 'linkedin', 'facebook', 'instagram' ] }
            })
            .then(connectors => {
                mongoose.set('debug', true);
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
            return that ._socialNetworks.model
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
            return that ._socialNetworks.model
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