import { HelpCenterResponse } from '../help-center.types';
import { HelpCenterQueryActivity } from '../activities/help-center-query.activity';
import { HelpCenter } from '../../../domain/app/help-center/help-center.model';
import { IHelpCenterDocument } from '../../../domain/app/help-center/help-center';
import { IQuery } from '../../../framework/queries/query';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { query } from '../../../framework/decorators/query.decorator';

@injectable()
@query({
    name: 'helpCenter',
    activity: HelpCenterQueryActivity,
    output: { type: HelpCenterResponse, isArray: true }
})
export class HelpCenterQuery implements IQuery<IHelpCenterDocument[]> {
    constructor(@inject(HelpCenter.name) private _helpCtrModel: HelpCenter) {}

    run(data: any): Promise<IHelpCenterDocument[]> {
        return this._helpCtrModel.model.helpVideos();
    }
}