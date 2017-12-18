import { IConnectorDocument } from './../../master/connectors/connector';
import { ISocialNetworkDocument } from './../social-networks/social-network';
import { SocialWidgetBase, SocialWidgetTypeEnum } from './social-widget-base';

interface ILinkedInMetrics {
    followed_by: number;
}

export class LinkedInSocialWidget extends SocialWidgetBase {
    constructor(private _connector: IConnectorDocument) {
        super();
        this.connectorId = this._connector._id;
        this.name = this._connector.name;
        this.valueDescription = 'Followers';
        this.type = SocialWidgetTypeEnum.linkedin.toString();
    }

    setValue(doc: ISocialNetworkDocument): void {
        if (!doc || !doc.metrics) { return; }
        this.value = (<ILinkedInMetrics>doc.metrics).followed_by;
    }

    setHistoricalValue(doc: ISocialNetworkDocument, textDate: string): void {
        if (!doc || !doc.metrics) { return; }

        const historicalData = {
            value: (<ILinkedInMetrics>doc.metrics).followed_by,
            period: textDate
        };

        this.historicalData = historicalData;
    }
}
