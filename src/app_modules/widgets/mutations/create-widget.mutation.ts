import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Widgets } from '../../../domain/app/widgets/widget.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { CreateWidgetActivity } from '../activities/create-widget.activity';
import { WidgetInput, WidgetMutationResponse } from '../widgets.types';
import { IWidgetInput } from '../../../domain/app/widgets/widget';


@injectable()
@mutation({
    name: 'createWidget',
    activity: CreateWidgetActivity,
    parameters: [
        { name: 'input', type: WidgetInput, required: true },
    ],
    output: { type: WidgetMutationResponse }
})
export class CreateWidgetMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Widgets.name) private _widgets: Widgets) {
        super();
    }

    run(data: { input: IWidgetInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._widgets.model.createWidget(data.input)
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
