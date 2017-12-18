import { IConnectorDocument } from '../../master/connectors/connector';
import { FacebookSocialWidget } from './facebook-social-widget';
import { InstagramSocialWidget } from './instagram-social-widget';
import { LinkedInSocialWidget } from './linkedin-social-widget';
import { SocialWidgetBase } from './social-widget-base';
import { TwitterSocialWidget } from './twitter-social-widget';

export class SocialWidgetFactory {
    static getInstance(doc: IConnectorDocument): SocialWidgetBase {
        switch (doc.type) {
            case 'linkedin':
                return new LinkedInSocialWidget(doc);

            case 'twitter':
                return new TwitterSocialWidget(doc);

            case 'facebook':
                return new FacebookSocialWidget(doc);

            case 'instagram':
                return new InstagramSocialWidget(doc);

            default:
                return;
        }
    }
}