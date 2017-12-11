import { ISocialNetworkDocument } from './../social-network/ISocialNetwork';
import { IConnectorDocument } from './../../master/connectors/IConnector';
import { SocialWidgetBase, SocialWidgetTypeEnum } from './social-widget-base';

interface IInstagramMetrics {
    followed_by: number;
    follows: number;
    posts: number;
}

export class InstagramSocialWidget extends SocialWidgetBase {
    constructor(private _connector: IConnectorDocument) {
        super();
        this.connectorId = this._connector._id;
        this.name = this._connector.name;
        this.valueDescription = 'Followers';
        this.type = SocialWidgetTypeEnum.instagram.toString();
    }

    setValue(doc: ISocialNetworkDocument): void {
        if (!doc || !doc.metrics) { return; }
        this.value = (<IInstagramMetrics>doc.metrics).followed_by;
    }

    setHistoricalValue(doc: ISocialNetworkDocument, textDate: string): void {
        if (!doc || !doc.metrics) { return; }

        const historicalData = {
            value: (<IInstagramMetrics>doc.metrics).followed_by,
            period: textDate
        };

        this.historicalData = historicalData;
    }
}
