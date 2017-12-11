import { ISocialNetworkDocument } from './../social-network/ISocialNetwork';

export enum SocialWidgetTypeEnum {
    twitter = 1,
    instagram = 2,
    facebook = 3,
    linkedin = 4
}

export interface ISocialWidgetHistoricalData {
    value: number;
    period: string;
}

export interface ISocialWidget {
    connectorId: string;
    name: string;
    value: number;
    valueDescription: string;
    historicalData?: ISocialWidgetHistoricalData;
    type: SocialWidgetTypeEnum | string;
}

export interface ISocialWidgetBase {
    setValue?(doc: ISocialNetworkDocument): void;
    setHistoricalValue?(doc: ISocialNetworkDocument, period: string): void;
    toSocialWidgetObject(): ISocialWidget;
}

export class SocialWidgetBase implements ISocialWidgetBase  {
    protected connectorId: string;
    protected name: string;
    protected value: number;
    protected valueDescription: string;
    protected historicalData: ISocialWidgetHistoricalData;
    protected type: SocialWidgetTypeEnum | string;

    setValue?(doc: ISocialNetworkDocument): void;
    setHistoricalValue?(doc: ISocialNetworkDocument, period: string): void;

    toSocialWidgetObject(): ISocialWidget {
        const widget: ISocialWidget = {
            connectorId: this.connectorId,
            name: this.name,
            value: this.value,
            valueDescription: this.valueDescription,
            type: SocialWidgetTypeEnum[this.type].toString()
        };

        if (this.historicalData) {
            widget.historicalData = this.historicalData;
        }

        return widget;
    }
}
