import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { SocialWidgetBase, ISocialWidget } from './../../../domain/app/social-widget/social-widget-base';
import { SocialWidgetsService } from './../../../services/social-widgets.service';
import { ListSocialWidgetsActivity } from './../activities/list-social-widgets.activity';
import { SocialWidget } from './../social-widgets.types';

@injectable()
@query({
    name: 'listSocialWidgets',
    activity: ListSocialWidgetsActivity,
    parameters: [
        { name: 'startDate', type: String }
    ],
    output: { type: SocialWidget, isArray: true }
})
export class ListSocialWidgetsQuery implements IQuery<ISocialWidget[]> {
    constructor(
        @inject(SocialWidgetsService.name) private _socialWidgetsService: SocialWidgetsService
    ) { }

    run(data: { startDate: string }): Promise<ISocialWidget[]> {
        return this._socialWidgetsService.getSocialWidgets(data.startDate, 'last 7 days');
    }
}
