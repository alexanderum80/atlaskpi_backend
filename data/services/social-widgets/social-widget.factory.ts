import { FacebookSocialWidget } from './../../models/app/social-widgets/facebook-social-widget';
import { InstagramSocialWidget } from './../../models/app/social-widgets/instagram-social-widget';
import { LinkedInSocialWidget } from './../../models/app/social-widgets/linkedin-social-widget';
import { SocialWidgetBase } from './../../models/app/social-widgets/social-widget-base';
import { TwitterSocialWidget } from './../../models/app/social-widgets/twitter-social-widget';
import { IConnectorDocument } from './../../models/master/connectors/IConnector';

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