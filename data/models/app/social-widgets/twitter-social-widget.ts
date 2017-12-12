import { ISocialNetworkDocument } from './../social-network/ISocialNetwork';
import { IConnectorDocument } from './../../master/connectors/IConnector';
import { SocialWidgetBase, SocialWidgetTypeEnum } from './social-widget-base';

interface ITwitterMetrics {
    listed_count: number;
    statuses_count: number;
    friends_count: number;
    followers_count: number;
}

export class TwitterSocialWidget extends SocialWidgetBase {
    constructor(private _connector: IConnectorDocument) {
        super();
        this.connectorId = this._connector._id;
        this.name = this._connector.name;
        this.valueDescription = 'Followers';
        this.type = SocialWidgetTypeEnum.twitter.toString();
    }

    setValue(doc: ISocialNetworkDocument): void {
        if (!doc || !doc.metrics) { return; }
        this.value = (<ITwitterMetrics>doc.metrics).followers_count;
    }

    setHistoricalValue(doc: ISocialNetworkDocument, textDate: string): void {
        if (!doc || !doc.metrics) { return; }

        const historicalData = {
            value: (<ITwitterMetrics>doc.metrics).followers_count,
            period: textDate
        };

        this.historicalData = historicalData;
    }
}
