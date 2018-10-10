import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Widgets } from '../../../domain/app/widgets/widget.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { UpdateWidgetActivity } from '../activities/update-widget.activity';
import { WidgetInput, WidgetMutationResponse } from '../widgets.types';
import { IWidgetInput } from '../../../domain/app/widgets/widget';
import { WidgetsService } from '../../../services/widgets.service';



@injectable()
@mutation({
    name: 'updateWidget',
    activity: UpdateWidgetActivity,
    parameters: [
        { name: 'id', type: String, required: true },
        { name: 'input', type: WidgetInput, required: true },
    ],
    output: { type: WidgetMutationResponse }
})
export class UpdateWidgetMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(Widgets.name) private _widgets: Widgets,
        @inject(WidgetsService.name) private _widgetsService: WidgetsService
    ) {
        super();
    }

    run(data: { id: string, input: IWidgetInput,  }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._widgetsService.updateWidget(data.id, data.input)
                .then(widget =>  {
                    resolve({ entity: widget, success: true });
                    return;
                })
                .catch(err => {
                    resolve({success: false, errors: [{ field: 'widget', errors: [err]} ]});
                    return;
                });
        });
    }
}
