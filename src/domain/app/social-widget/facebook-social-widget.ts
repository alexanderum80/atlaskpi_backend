import { IConnectorDocument } from '../../master/connectors/connector';
import { ISocialNetworkDocument } from './../social-networks/social-network';
import { SocialWidgetBase, SocialWidgetTypeEnum } from './social-widget-base';

interface IFacebookMetrics {
    were_here_count: number;
    talking_about_count: number;
    rating_count: number;
    checkins: number;
    fan_count: number;
}

export class FacebookSocialWidget extends SocialWidgetBase {
    constructor(private _connector: IConnectorDocument) {
        super();
        this.connectorId = this._connector._id;
        this.name = this._connector.name;
        this.valueDescription = 'Fans';
        this.type = SocialWidgetTypeEnum.facebook.toString();
    }

    setValue(doc: ISocialNetworkDocument): void {
        if (!doc || !doc.metrics) { return; }
        this.value = (<IFacebookMetrics>doc.metrics).fan_count;
    }

    setHistoricalValue(doc: ISocialNetworkDocument, textDate: string): void {
        if (!doc || !doc.metrics) { return; }

        const historicalData = {
            value: (<IFacebookMetrics>doc.metrics).fan_count,
            period: textDate
        };

        this.historicalData = historicalData;
    }
}
