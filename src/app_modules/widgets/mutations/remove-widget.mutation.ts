import { Logger } from './../../../domain/app/logger';
import { WidgetsService } from './../../../services/widgets.service';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Widgets } from '../../../domain/app/widgets/widget.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { RemoveWidgetActivity } from '../activities/remove-widget.activity';
import { WidgetMutationResponse } from '../widgets.types';

@injectable()
@mutation({
    name: 'removeWidget',
    activity: RemoveWidgetActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: WidgetMutationResponse }
})
export class RemoveWidgetMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(WidgetsService.name) private _widgetsService: WidgetsService,
        @inject(Logger.name) private _logger: Logger
    ) {
        super();
    }

    run(data: { id: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._widgetsService.removeWidgetById(data.id)
                .then(widget =>  {
                    resolve({ entity: widget, success: true });
                    return;
                })
                .catch(err => {
                    that._logger.error(err);
                    resolve({success: false, errors: [err]});
                    return;
                });
        });
    }
}
