import * as Promise from 'bluebird';

import { IIdentity } from '../../../models/app/identity';
import { QueryBase } from '../../query-base';
import { ISocialWidget } from './../../../models/app/social-widgets/social-widget-base';
import { SocialWidgetsService } from './../../../services/social-widgets/social-widgets.service';

export class ListSocialWidgetsQuery extends QueryBase<ISocialWidget[]> {

    constructor(
            public identity: IIdentity,
            private _socialWidgetsService: SocialWidgetsService) {
                super(identity);
            }

    run(data: { startDate: string }): Promise<ISocialWidget[]> {
        return this._socialWidgetsService.getSocialWidgets(data.startDate, 'last 7 days');
    }
}
